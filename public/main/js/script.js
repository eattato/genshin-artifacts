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

  // 카드 데이터 불러오기
  fetch(serverUrl + "data/card", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      for (let ind in res) {
        let data = res[ind];
        addCharacterCard(
          data.name,
          "../resource/images/characters/" + data.face,
          data.element,
          data.star
        );
      }
    });

  // 자동 제출 기능
  let inSubmit = false;
  let autoSubmit = $(".edit_submit");
  let serverInput = $("#server");
  let uidInput = $("#uid");
  let ltuidInput = $("#ltuid");
  let ltokenInput = $("#ltoken");

  autoSubmit.click(() => {
    if (inSubmit == false) {
      let uid = uidInput.val();
      if (uid && Number(uid)) {
        inSubmit = true;
        fetch(serverUrl + "cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((res) => {
            console.log(res);
          })
          .finally(() => {
            inSubmit = false;
          });
      }
    }
  });
});
