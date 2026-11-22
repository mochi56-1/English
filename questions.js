const parts = [
  { name: "写真描写", instruction: "写真を最もよく表す選択肢を選ぶ" },
  { name: "応答", instruction: "発言に対する自然な応答を選ぶ" },
  { name: "会話", instruction: "会話を聞いて質問に答える" },
  { name: "説明文", instruction: "アナウンスを聞いて質問に答える" },
  { name: "短文穴埋め", instruction: "空欄に入る語句を選ぶ" },
  { name: "長文穴埋め", instruction: "文書の空欄に入る語句を選ぶ" },
  { name: "読解", instruction: "文書を読んで質問に答える" }
];

const dialogue = "Woman: Is the brochure ready to print?\nMan: Almost. I need the updated prices from Nina.\nWoman: I'll ask her to send them by noon.";
const announcement = "Attention, passengers. The nine fifteen train to Weston will depart from platform four today. Please use the stairs near the ticket office.";
const email = "From: Facilities\nSubject: Office kitchen\n\nThe office kitchen will be closed on Friday while new cabinets are [1]. You can still use the coffee machine in the lobby. We expect the kitchen to reopen [2] Monday morning.";
const reading = "NOTICE — Harbor Library\nSaturday's photo workshop will begin at 10:30 a.m. in Room 204. Bring a phone or camera. Registration is free, but participants should reserve a seat by Thursday.";
const reply = "EMAIL — To: Harbor Library\nI'd like to reserve a spot for Saturday. My camera is being repaired, so I'll bring my phone. Do you have a place to charge it during the workshop? — Emi";

const extraQuestions = [
  { part: 1, image: "greenhouse.jpg", audio: "part1.mp3", hiddenOptions: true,
    options: ["A person is watering a plant.", "Some shelves are being painted.", "A person is carrying a ladder.", "Several boxes are stacked by a door."],
    answer: 0, explanation: "じょうろで鉢植えに水をやっているので、A person is watering a plant. が正解です。" },
  { part: 2, audio: "part2a.mp3", hiddenOptions: true, spokenPrompt: "Where should I leave the keys?",
    options: ["On the front desk.", "At three o'clock.", "I bought a lock yesterday."],
    answer: 0, explanation: "Where に対して、鍵を置く場所を示す On the front desk. が自然です。" },
  { part: 2, audio: "part2b.mp3", hiddenOptions: true, spokenPrompt: "Haven't you ordered the chairs yet?",
    options: ["Yes, they arrived this morning.", "The table is round.", "About twenty minutes."],
    answer: 0, explanation: "今朝届いたという応答から、すでに注文したことがわかります。" },
  { part: 3, audio: "part3.mp3", transcript: dialogue, prompt: "What does the man need?",
    options: ["A new printer", "Updated prices", "A delivery address", "An extra copy"],
    answer: 1, explanation: "I need the updated prices from Nina. から、必要なのは更新後の価格です。" },
  { part: 3, audio: "part3.mp3", transcript: dialogue, prompt: "What will the woman do?",
    options: ["Print some brochures", "Check a delivery", "Contact Nina", "Change the prices"],
    answer: 2, explanation: "I'll ask her to send them. の her は Nina を指します。" },
  { part: 3, audio: "part3.mp3", transcript: dialogue, prompt: "When does the woman want the prices sent?",
    options: ["By noon", "By the end of the day", "On Friday", "The next morning"],
    answer: 0, explanation: "by noon は「正午までに」という意味です。" },
  { part: 4, audio: "part4.mp3", transcript: announcement, prompt: "What change is being announced?",
    options: ["A different destination", "A later departure time", "A different platform", "A new ticket price"],
    answer: 2, explanation: "will depart from platform four today で、今日の発車ホームを案内しています。" },
  { part: 4, audio: "part4.mp3", transcript: announcement, prompt: "What are listeners asked to do?",
    options: ["Buy another ticket", "Take a bus", "Wait at the ticket office", "Use the stairs"],
    answer: 3, explanation: "Please use the stairs near the ticket office. が乗客への指示です。" },
  { part: 4, audio: "part4.mp3", transcript: announcement, prompt: "Where is the train going?",
    options: ["Weston", "Harbor", "Kingston", "Dover"],
    answer: 0, explanation: "the train to Weston の to が行き先を示しています。" },
  { part: 6, passages: [email], prompt: "Choose the best word for blank [1].",
    options: ["installation", "install", "installed", "installs"],
    answer: 2, explanation: "キャビネットは取り付けられる側なので are installed と受動態にします。" },
  { part: 6, passages: [email], prompt: "Choose the best word for blank [2].",
    options: ["on", "at", "in", "within"],
    answer: 0, explanation: "曜日を含む Monday morning の前には on を置きます。" },
  { part: 7, passages: [reading], prompt: "When should participants reserve a seat?",
    options: ["By Thursday", "On Friday evening", "On Saturday morning", "After the workshop"],
    answer: 0, explanation: "reserve a seat by Thursday が、席の予約期限を示しています。" },
  { part: 7, passages: [reading, reply], prompt: "What will Emi probably use in Room 204?",
    options: ["A laptop", "A phone", "A library camera", "A projector"],
    answer: 1, explanation: "告知によると会場は Room 204 です。メールで Emi はカメラを修理中なのでスマホを持参すると伝えています。" },
  { part: 7, passages: [reading, reply], prompt: "What does Emi want to find out?",
    options: ["How much the workshop costs", "Where to repair a camera", "When the library closes", "Whether she can charge her phone"],
    answer: 3, explanation: "Do you have a place to charge it? と、スマホを充電できる場所があるかを聞いています。" }
];

function listeningScript(question) {
  if (!question.hiddenOptions) return question.transcript;
  const options = question.options.map((option, index) => "Choice " + "ABCD"[index] + ". " + option);
  return [question.spokenPrompt, ...options].filter(Boolean).join("\n");
}
