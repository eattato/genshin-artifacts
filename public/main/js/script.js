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
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      for (let ind in res) {
        let data = res[ind];
        addCharacterCard(data.name, data.face, data.element, data.star);
      }
    });

  addCharacterCard(
    "닐?루",
    "../resource/images/characters/nilou.webp",
    "hydro",
    5
  );
});
