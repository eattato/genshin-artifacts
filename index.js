const express = require("express");
const session = require("express-session")
const bodyParser = require("body-parser");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");

// App Config
const app = express();
app.use(bodyParser.json());
app.use(session(JSON.parse(fs.readFileSync("config/session.json", "utf8"))));

// Functions
const getRandomStr = (length) => {
  let result = "";
  for (let ind = 1; ind <= length; ind++) {
    let chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let char = chars.charAt(Math.floor(Math.random() * chars.length));
    result += char;
  }
  return result;
};

const genDynamicSecret = (server) => {
  dsSalt = "6cqshh5dhw73bzxn20oexa9k516chk7s";
  current = Math.floor(Date.now() / 1000);
  randomStr = getRandomStr(6);

  let target = `salt=${dsSalt}&t=${current}&r=${randomStr}`;
  let hash = crypto.createHash("md5").update(target).digest("hex");
  return `${current},${randomStr},${hash}`;
};

// Requests
app.get("/data/:type", (req, res) => {
  let param = req.params.type;
  if (param == "card") {
    let data = fs.readFileSync("public/resource/datas/card.json");
    data = JSON.parse(data);
    res.json(data);
  }
});

app.get("/enka/:uid", (req, res) => {
  let uid = req.params.uid;
  if (uid && Number(uid)) {
    let headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`https://enka.network/u/${uid}/__data.json`, { headers: headers })
      .then((enka) => {
        let charList = [];
        let weaponList = [];
        let artifactsList = [];

        res.json(enka.data);
      });
  }
});

app.post("/cards", (req, res) => {
  // 원신 API 사용법은 https://arca.live/b/dev0/46827296?p=1 참고
  let ltuid = req.body.ltuid;
  let ltoken = req.body.ltoken;
  let server = req.body.server;
  let uid = req.body.uid;

  // ltuid, uid는 숫자여야하고 server는 os_asia, os_usa, os_euro, os_cht 중 하나여야 함
  if (!isNaN(ltuid) && ltoken && !isNaN(uid) && (server == "os_asia" || server == "os_usa" || server == "os_euro" || server == "os_cht")) {
    let ds = genDynamicSecret();
    let url = `https://bbs-api-os.hoyolab.com/game_record/genshin/api/index?server=${server}&role_id=${uid}`
    let headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "ko-kr",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      "x-rpc-app_version": "1.5.0", // 필수 데이터
      "x-rpc-client_type": "4", // 필수 데이터, 이거 5로 해서 안되는 거였음 엌ㅋㅋ
      "x-rpc-language": "ko-kr", // 한국어로 데이터 가져올거임
      ds: genDynamicSecret(), // 필수 데이터
      cookie: `ltoken=${ltoken}; ltuid=${ltuid}`, // 필수 데이터, 쿠키를 등록
    };

    // 미호요에 request검
    axios.get(url, {headers})
    .then((mihoyo) => {
      mihoyo = mihoyo.data;
      if (mihoyo.retcode == 0 && mihoyo.message == "OK") {
        mihoyo.data["result"] = true;
        res.json(mihoyo.data);
      } else {
        res.json({
          "result": false,
          "desc": "welp, mihoyo api declined you"
        });
      }
    })
    .catch((e) => {
      res.json({
        "result": false,
        "desc": `request failed - ${e}`
      });
    });
  } else {
    res.json({
      "result": false,
      "desc": "wrong parameters"
    });
  }
});

// Open static files
app.use(express.static(__dirname + "/public"));

// Create Server
let server = app.listen(8888, () => {
  console.log("서버 열림");
});

// OS_DS_SALT = "6cqshh5dhw73bzxn20oexa9k516chk7s"
// CN_DS_SALT = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs"
// OS_TAKUMI_URL = "https://api-os-takumi.mihoyo.com/"  # overseas
// CN_TAKUMI_URL = "https://api-takumi.mihoyo.com/"  # chinese
// OS_GAME_RECORD_URL = "https://bbs-api-os.hoyoverse.com/game_record/"
// CN_GAME_RECORD_URL = "https://api-takumi.mihoyo.com/game_record/app/"
