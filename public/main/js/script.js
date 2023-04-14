let serverUrl = "http://localhost:8888/";

const getData = (key) => {
  let data = localStorage.getItem(key);
  if (data) {
    data = JSON.parse(data);
  }
  return data;
}

const getElementById = (list, id) => {
  let result = null;
  for (let i in list) {
    let element = list[i];
    if (element.id == id) {
      result = element;
      break;
    }
  }
  return result;
}

const getDistinct = (origin, targets) => {
  let result = [];
  for (let i in targets) {
    let target = targets[i];
    if (!getElementById(origin, target.id)) {
      result.push(target);
    }
  }
  return result;
}

const isNameFirst = (a, b) => {
  let test = [a, b];
  test.sort();
  if (test[0] == a) {
    return true;
  } else {
    return false;
  }
}

const swap = (arr, a, b) => {
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function sleep(ms) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) { }
}

// 메인
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

  const sortCharacters = (characters) => {
    let sortCount = characters.length - 1;

    // 등급 정렬
    for (let i = 0; i < sortCount; i++) {
      for (let c = 0; c < sortCount; c++) {
        let c1 = characters[c];
        let c2 = characters[c + 1];
        if (c2.rarity > c1.rarity) {
          swap(characters, c, c + 1);
        }
      }
    }

    // 이름 정렬
    for (let i = 0; i < sortCount; i++) {
      // console.log(`-----------${i + 1}번째 루프---------`)
      for (let c = 0; c < sortCount - i; c++) {
        let c1 = characters[c];
        let c2 = characters[c + 1];
        if (c1.rarity == c2.rarity && isNameFirst(c2.name, c1.name)) {
          // console.log(`${c1.name}(${c})와 ${c2.name}(${c + 1})를 스왑`);
          swap(characters, c, c + 1);
        } else if (c1.rarity == c2.rarity) {
          // console.log(c1.name + "랑 " + c2.name + " 그대로,");
        }
      }
    }
  }

  const loadCharacters = (characters) => {
    if (characters) {
      // 정렬
      sortCharacters(characters)
      for (let ind in characters) {
        let avatar = characters[ind];
        addCharacterCard(avatar);
      }
    }
  };

  // 카드 데이터 불러오기
  let avatars = getData("avatars");
  let artifacts = getData("artifacts");
  if (avatars) {
    loadCharacters(avatars);
  }

  const getArtifacts = (avatars) => {
    let result = []
    for (let i in avatars) {
      let avatar = avatars[i];
      let reliquaries = avatar.reliquaries;
      for (let i in reliquaries) {
        let artifact = reliquaries[i];
        if (!getElementById(artifacts, artifact.id)) {
          result.push(artifact);
        }
      }
    }
    return result;
  }

  const replaceReliquariesToId = (avatars) => {
    for (let i in avatars) {
      let avatar = avatars[i];
      let reliquaries = avatar.reliquaries;
      let ids = [];
      for (let i in reliquaries) {
        let artifact = reliquaries[i];
        ids.push(artifact.id);
      }
      avatar.reliquaries = ids;
    }
    return avatars;
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
              let addedArtifacts = getArtifacts(res.avatars);
              let addedAvatars = replaceReliquariesToId(res.avatars);

              console.log(addedArtifacts);
              console.log(getDistinct(artifacts, addedArtifacts));

              avatars = avatars.concat(getDistinct(avatars, addedAvatars));
              artifacts = artifacts.concat(getDistinct(artifacts, addedArtifacts));
              localStorage.setItem("avatars", JSON.stringify(avatars));
              localStorage.setItem("artifacts", JSON.stringify(artifacts));
              // setCookie("avatars", JSON.stringify(res.avatars), 100000);
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
