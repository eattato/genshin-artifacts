let serverUrl = "http://localhost:8888/";

function setCookie(name, value, days) {
  var expires = "";
  if (!days) {
    days = 1;
  }

  var date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  expires = "; expires=" + date.toUTCString();
  document.cookie =
    name + "=" + (value || "") + "; expires=" + expires + "; path=/";
  console.log(document.cookie);
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

$().ready(() => {
  let characters = $(".character_list");
  let origin = window.location.href;
  origin = origin.split("/").slice(0, -2).join("/");

  const addCharacterCard = (data) => {
    let card =
      '<div class="character_frame"><img class="character_element" src="" /><div class="character_image"><img src="" /></div><div class="character_name"></div></div>';
    card = $($.parseHTML(card));
    card.find(".character_name").text(data.name);
    card.find(".character_image img").attr("src", data.icon);

    let elementPath =
      "../resource/images/elements/" + data.element + "_blur.png";
    card.find(".character_element").attr("src", elementPath);

    if (data.rarity == 5) {
      card.addClass("five_star");
    } else {
      card.addClass("four_star");
    }

    card.click(() => {
      window.location.href = origin + "/card?id=" + data.id;
    });
    card.appendTo(characters);
  };

  const loadCharacters = (characters) => {
    if (characters) {
      for (let ind in characters) {
        let avatar = characters[ind];
        addCharacterCard(avatar);
      }
    }
  };

  // 카드 데이터 불러오기
  let avatars = getCookie("avatars");
  let artifacts = getCookie("artifacts");
  if (avatars) {
    loadCharacters(JSON.parse(avatars));
  }

  if (artifacts == null) {
    artifacts = [];
  }

  const getArtifactById = (id) => {
    for (let i in artifacts) {
      let artifact = artifacts[i];
      if (artifact.id == id) {
        return artifact;
      }
    }
    return null;
  }

  // 자동 제출 기능
  let inSubmit = false;
  let autoSubmit = $(".edit_submit");
  let serverInput = $("#server");
  let uidInput = $("#uid");
  let ltuidInput = $("#ltuid");
  let ltokenInput = $("#ltoken");

  autoSubmit.click(() => {
    if (inSubmit == false) {
      if (isNaN(uidInput.val())) {
        uidInput.addClass("error");
      } else if (isNaN(ltuidInput.val())) {
        ltuidInput.addClass("error");
      } else if (ltokenInput.val().length == 0) {
        ltokenInput.addClass("error");
      } else {
        uidInput.removeClass("error");
        ltuidInput.removeClass("error");
        ltokenInput.removeClass("error");

        inSubmit = true;
        fetch(serverUrl + "cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ltuid: ltuidInput.val(),
            ltoken: ltokenInput.val(),
            uid: uidInput.val(),
            server: serverInput.val(),
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.result == true) {
              for (let i in res.avatars) {
                let avatar = res.avatars[i];

                // 캐릭터가 낀 성유물 가져옴
                let reliquaries = [];
                for (let r in res.reliquaries) {
                  // 같은 종류 성유물도 ID는 다 다름, 고유함
                  let artifact = res.reliquaries[r];
                  reliquaries.push(artifact.id);
                  if (!getArtifactById(artifact.id)) { // 같은 ID의 성유물이 없어야함
                    artifacts.push(artifact);
                  }
                }
                avatar.reliquaries = reliquaries;
              }

              setCookie("avatars", JSON.stringify(res.avatars), 100000);
              console.log(document.cookie);
              loadCharacters(res.avatars);
            }
          })
          .finally(() => {
            inSubmit = false;
          });
      }
    }
  });
});
