let serverUrl = "http://localhost:8888/";

$().ready(() => {
  let characters = $(".character_list");

  const addCharacterCard = (name, face, element, star) => {
    let card =
      '<div class="character_frame"><img class="character_element" src="" /><div class="character_image"><img src="" /></div><div class="character_name"></div></div>';
    card = $($.parseHTML(card));
    card.find(".character_name").text(name);
    card.find(".character_image img").attr("src", face);

    let elementPath = "../resource/images/elements/" + element + "_blur.png";
    card.find(".character_element").attr("src", elementPath);

    if (star == 5) {
      card.addClass("five_star");
    } else {
      card.addClass("four_star");
    }

    card.appendTo(characters);
  };

  const loadCharacters = (characters) => {
    if (characters) {
      for (let ind in characters) {
        let avatar = characters[ind];
        addCharacterCard(avatar.name, avatar.image, avatar.element, avatar.rarity);
      }
    }
  }

  // 카드 데이터 불러오기
  let avatars = $.cookie("avatars");
  if (avatars) {
    loadCharacters(JSON.parse(avatars));
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
          })
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.result == true) {
              $.cookie("avatars", JSON.stringify(res.avatars));
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
