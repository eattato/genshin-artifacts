$().ready(() => {
  let characters = $(".characters");

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

  addCharacterCard(
    "닐?루",
    "../resource/images/characters/nilou.webp",
    "hydro",
    5
  );
});
