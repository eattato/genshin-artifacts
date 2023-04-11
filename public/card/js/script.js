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

const addElementRow = (card, data) => {
  let parent = card.find(".grid_element");
  let element = '<div class="grid_element_row"><img class="grid_element_icon" src="" /><div class="grid_element_title"></div></div>'
  element = $($.parseHTML(element));
  element.find(".grid_element_title").text(data.text);
  element.appendTo(parent);
}

const addItemCard = (data) => {
  let card =
    '<div class="grid_frame"><div class="grid_element"></div><div class="grid_image"><img src="" /></div><div class="grid_name"></div></div>';
  card = $($.parseHTML(card));
  card.find(".grid_name").text(data.name);
  card.find(".grid_image img").attr("src", data.icon);

  if (data.rarity == 5) {
    card.addClass("five_star");
  } else {
    card.addClass("four_star");
  }
  return card;
};

// 메인
$().ready(() => {
  // URL 데이터 가져오기
  let urlData = new URL(window.location.href);
  let cardId = urlData.searchParams.get("id");

  // 카드 데이터 불러오기
  let avatars = getData("avatars");
  let artifacts = getData("artifacts");
  if (avatars) {
    // loadCharacters(avatars);
  }
  let viewingAvatar = getElementById(avatars, cardId);

  // 성유물 불러오기
  let artifactOptions = [];
  let artifactFrame = $("#artifact_frame");
  for (let i in artifacts) {
    let artifact = artifacts[i];
    let card = addItemCard(artifact);
    card.appendTo(artifactFrame);
    addElementRow(card, { icon: "", text: "치확 %" });

    // 착용 중인 성유물이면 보더 라인
    if (viewingAvatar) {
      let reliquaries = viewingAvatar.reliquaries;
      for (let i in reliquaries) {
        let id = reliquaries[i];
        if (artifact.id == id) {
          card.css({ "border": "5px solid limegreen" });
          break;
        }
      }
    }
  }

  // 현재 캐릭터 데이터 가져오기
  if (viewingAvatar) {
    $(".character_title").text(viewingAvatar.name);
    $(".character_element").attr("src", "../resource/images/elements/" + viewingAvatar.element + "_blur.png")
    $(".character_desc").text("Lv. " + viewingAvatar.level);
    $(".character_img img").attr("src", viewingAvatar.image);

    // 장착물 불러오기
    let reliquaries = viewingAvatar.reliquaries
    for (let i in reliquaries) {
      let id = reliquaries[i];
      let artifact = getElementById(artifacts, id);
      if (artifact) {
        let frame = $(".character_artifacts > .character_equipment").eq(artifact.pos - 1);
        frame.find("img").attr("src", artifact.icon)
      }
    }

    let weapon = viewingAvatar.weapon
    $("#weapon").find("img").attr("src", weapon.icon);
  }
})