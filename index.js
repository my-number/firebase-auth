const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const { verify } = require("./myna/pkg/myna");
const crypto = require("crypto");
const GLITCH = 60; // 60sec

const sha256 = (h) => crypto.createHash("sha256").update(h).digest();
exports.signIn = functions.https.onCall(async (data, context) => {
  try {
    const cert = Buffer.from(data.cert);

    /* とんでもない実装 スタート*/
    const timestamp = data.timestamp;
    const now = parseInt(Date.now() / 1000);
    if (Math.abs(timestamp - now) > GLITCH) {
      return {
        error: "端末の時刻を正確に設定してください",
      };
    }
    /* とんでもない実装 エンド 頼むので見なかったことにしてください */
    const hash = sha256(timestamp.toString());

    const result = verify(cert, Buffer.from(data.sig), hash);
    if (!result) {
      return {
        error: "署名の検証に失敗しました",
      };
    }
    try {
      const token = await admin
        .auth()
        .createCustomToken(sha256(cert).toString("hex"));
      return {
        token,
      };
    } catch (e) {
      return {
        error: "サーバーエラーです。中の人しか解決できないと思います",
      };
    }
  } catch (e) {
    return {
      error: "必要な情報が不足しています",
    };
  }
});
