const bank = [
  ["The marketing team will ___ the campaign results on Friday.", ["present", "presentation", "presented", "presenting"], 0, "助動詞 will の直後には動詞の原形 present（発表する）が入ります。"],
  ["Please submit your expense report ___ the end of the month.", ["among", "by", "during", "since"], 1, "by は期限を表します。by the end of the month は「月末までに」です。"],
  ["The instructions were written ___ so that new employees could follow them.", ["clarity", "clear", "clearly", "clearing"], 2, "written（書かれた）を修飾する副詞 clearly（明確に）が入ります。"],
  ["The conference room is unavailable ___ it is being renovated.", ["despite", "unless", "until", "because"], 3, "後ろに主語と動詞があり、改装が利用できない理由なので because が入ります。"],
  ["All visitors must wear an identification badge ___ in the building.", ["while", "during", "since", "throughout"], 0, "while in the building は while they are in the building を短くした形です。"],
  ["The catering company can ___ special dietary requests.", ["accommodation", "accommodate", "accommodating", "accommodates"], 1, "助動詞 can の直後には原形 accommodate（要望に対応する）を置きます。"],
  ["Each of the invoices ___ a reference number.", ["have", "having", "has", "to have"], 2, "主語の中心は単数扱いの Each なので、動詞は has です。"],
  ["Sales increased after the store ___ its opening hours last spring.", ["extends", "will extend", "extending", "extended"], 3, "last spring は過去の時点を表すため、過去形 extended が入ります。"],
  ["The new printer is more energy-efficient ___ the previous model.", ["than", "as", "to", "from"], 0, "more を使った比較では、比較対象の前に than を置きます。"],
  ["Customers may return unused items ___ 30 days of purchase.", ["beside", "within", "between", "toward"], 1, "within 30 days of purchase は「購入後30日以内に」です。"],
  ["A confirmation email will be sent once your payment has been ___.", ["receive", "receiving", "received", "receives"], 2, "has been received は現在完了の受動態で、「受領された」という意味です。"],
  ["The manager asked us to ___ the proposal before the meeting.", ["notify", "attend", "arrive", "review"], 3, "review the proposal は「提案書に目を通す」という意味です。"],
  ["Everyone ___ attends the workshop will receive a certificate.", ["who", "whose", "whom", "what"], 0, "関係代名詞 who は人を先行詞とし、ここでは attends の主語になります。"],
  ["The application form is available in ___ English and Japanese.", ["either", "both", "neither", "each"], 1, "both A and B は「AとBの両方」を表します。"],
  ["We had to postpone the delivery ___ a shortage of drivers.", ["even though", "therefore", "due to", "because"], 2, "due to の後ろに名詞句を置き、「運転手の不足のために」と理由を示します。"]
];

const session = document.querySelector("#session");
const home = session.innerHTML;
const storageKey = "toeic-practice-history-v1";
let persistenceFailed = false;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? { answered: 0, correct: 0, missed: [] };
  } catch {
    return { answered: 0, correct: 0, missed: [] };
  }
}

const historyData = loadHistory();

function refreshStats() {
  document.querySelector("#attempts").textContent = historyData.answered;
  document.querySelector("#accuracy").textContent = historyData.answered
    ? Math.round(100 * historyData.correct / historyData.answered) + "%"
    : "—";
  document.querySelector("#due").textContent = historyData.missed.length;
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function showHome(focus = false) {
  session.innerHTML = home;
  session.querySelector("#start").onclick = () => play(shuffle(bank.map((_, id) => id)).slice(0, 10), "練習");
  session.querySelector("#review").onclick = () => {
    if (historyData.missed.length) {
      play(shuffle(historyData.missed), "復習");
    } else {
      session.querySelector("#message").textContent = "復習する問題はありません。";
    }
  };
  if (focus) session.querySelector("h2").focus();
}

function play(ids, mode) {
  let index = 0;
  let score = 0;

  function showQuestion() {
    const id = ids[index];
    const [prompt, options, answer, explanation] = bank[id];
    session.innerHTML = `
      <p class="progress">${mode} · ${index + 1} / ${ids.length} 問</p>
      <progress aria-label="回答済みの問題数" max="${ids.length}" value="${index}"></progress>
      <h2 id="session-title" tabindex="-1">空欄に入る語句を選ぶ</h2>
      <p class="prompt" lang="en"></p>
      <div class="choices"></div>
      <p class="feedback" role="status"></p>
      <div class="actions"><button class="primary" id="next" hidden>次の問題</button><button id="home">ホームに戻る</button></div>`;
    session.querySelector(".prompt").textContent = prompt;
    const choices = session.querySelector(".choices");
    const next = session.querySelector("#next");
    const buttons = [];
    let answered = false;

    for (const optionIndex of shuffle(options.map((_, position) => position))) {
      const button = document.createElement("button");
      button.lang = "en";
      button.textContent = options[optionIndex];
      button.onclick = () => {
        if (answered) return;
        answered = true;
        const isCorrect = optionIndex === answer;
        score += Number(isCorrect);
        historyData.answered += 1;
        historyData.correct += Number(isCorrect);
        historyData.missed = historyData.missed.filter(item => item !== id);
        if (!isCorrect) historyData.missed.push(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(historyData));
        } catch {
          if (!persistenceFailed) {
            document.querySelector(".note").textContent = "この環境では学習記録を保存できません。";
            persistenceFailed = true;
          }
        }
        refreshStats();
        for (const choice of buttons) choice.disabled = true;
        buttons.find(choice => choice.textContent === options[answer]).classList.add("correct");
        if (!isCorrect) button.classList.add("incorrect");
        const feedback = session.querySelector(".feedback");
        feedback.textContent = (isCorrect ? "正解。" : "不正解。正解は " + options[answer] + "。") + explanation;
        session.querySelector("progress").value = index + 1;
        next.hidden = false;
        next.textContent = index + 1 === ids.length ? "結果を見る" : "次の問題";
        next.focus();
      };
      buttons.push(button);
      choices.append(button);
    }

    next.onclick = () => {
      index += 1;
      if (index < ids.length) {
        showQuestion();
        return;
      }
      session.innerHTML = `
        <h2 id="session-title" tabindex="-1">${mode}結果</h2>
        <p>${ids.length}問中 ${score}問正解（${Math.round(100 * score / ids.length)}%）</p>
        <div class="actions"><button class="primary" id="home">ホームに戻る</button></div>`;
      session.querySelector("#home").onclick = () => showHome(true);
      session.querySelector("h2").focus();
    };
    session.querySelector("#home").onclick = () => showHome(true);
    session.querySelector("h2").focus();
  }

  showQuestion();
}

refreshStats();
showHome();

if (window.isSecureContext && location.protocol !== "file:" && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(error => {
    console.warn("オフライン機能を準備できませんでした。", error);
  });
}
