
import {
  Configuration,
  OpenAIApi
} from 'https://cdn.skypack.dev/openai';

let lang_code = "ko-KR";
let speechToText = "";
let isRecognizing = false;
let allMessages = [];

const speechContent = window.speechSynthesis;
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = lang_code;
recognition.continuous = true;
recognition.maxAlternatives = 10000;

const mic = document.querySelector(".mic");
const finalSpan = document.querySelector("#final_span");
const interimSpan = document.querySelector("#interim_span");
const recording_state = document.querySelector("#recording-state");
const messageContainer = document.querySelector(".chat-container");
const downloadButton = document.querySelector('.download-button');

//기능 2. web speech api를 사용해 음성 채팅
recognition.addEventListener("result", (e) => {
  let interimTranscript = "";
  for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
    let transcript = e.results[i][0].transcript;
    console.log(transcript);
    if (e.results[i].isFinal) {
      if (interimTranscript !== "") {
        interimTranscript += " "; // 각 문장 사이에 공백 추가
        finalSpan.textContent += interimTranscript;
        interimTranscript = ""; // 문장이 완료되면 interimTranscript를 초기화합니다.
      }
      speechToText = transcript;
      finalSpan.textContent += speechToText;
    } else {
      interimTranscript += transcript;
    }
  }
  interimSpan.textContent = interimTranscript;

  if (interimTranscript === "") {
    const inputMessage = finalSpan.textContent;
    sendMessageToAI(inputMessage);
    displayMessage(inputMessage, "user-message");
    finalSpan.textContent = ""; // 메시지 추가 후 finalSpan 비우기
  }
});

//마이크 클릭시 음성인식 시작
mic.addEventListener("click", () => {
  //클릭시 음성인식 시작
  if (!isRecognizing) {
    recognition.start();
    isRecognizing = true;
    recording_state.className = 'on';
  }
  //다시 클릭시 음성인식 종료
  else {
    recognition.stop();
    isRecognizing = false;
    recording_state.className = "off";
  }
});

//텍스트 음성으로 변환
const speak = (text = '') => {
  const speech = new SpeechSynthesisUtterance(text);
  console.log(speech);
  speech.lang = lang_code;
  speech.rate = 1;

  speechContent.speak(speech, true);
};

//기능 1. openai api를 사용해 봇과 채팅 기능
function sendMessageToAI(message) {
  const configuration = new Configuration({
    apiKey: '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',
  });
  const openai = new OpenAIApi(configuration);
  
  const response = openai.createCompletion({
    model: "text-davinci-003",
    prompt: message,
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  }).then((response) => { //챗봇 응답 부분
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const botMessage = response.data.choices[0].text;
      speak(botMessage);
      displayMessage(botMessage, 'bot-message', messageContainer);
    } else {
      displayMessage('Error: Empty response', 'error-message', messageContainer);
    }
    console.log(response.data);
  }).catch((error) => {
    displayMessage('Error: ' + error.message, 'error-message', messageContainer);
  });
}

//채팅창에 메시지 출력
//className: user-message, bot-message, error-message
function displayMessage(message, className) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', className);

  if (className !== 'user-message')
    messageElement.setAttribute('data-highlight', 'true');
  messageElement.textContent = message;

  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;

  const messageData = {
    message: message,
    className: className
  };

 allMessages.push(messageData);

 const allMessagesJson = JSON.stringify(allMessages);

 localStorage.setItem('savedMessages', allMessagesJson);
}

//기능 3. 대화 내용 다운로드
function downloadMessages() {
  const data = JSON.stringify(allMessages, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'messages.json';
  link.click();
}

downloadButton.addEventListener('click', downloadMessages);

//사용 언어 변경
document.addEventListener('DOMContentLoaded', function() {
  const languageTable = document.getElementById('language-table');
  const languageRows = languageTable.getElementsByTagName('tr');

  for (let i = 1; i < languageRows.length; i++) {
    languageRows[i].addEventListener('click', function() {
      const language = this.cells[0].innerText;
      const code = this.cells[1].innerText;
      console.log('Selected language:', language);
      console.log('Selected code:', code);
      lang_code = code;
      recognition.lang = lang_code;
      console.log(recognition.lang);
    });
    
  }
});

//네트워크 연결 확인
function checkNetworkConnection() {
  const online = navigator.onLine;
  if (!online) {
    displayMessage('Error: Network connection is not available', 'error-message', messageContainer);
  }
}

//페이지가 로드될 때 네트워크 연결 확인
window.addEventListener('load', checkNetworkConnection);

//네트워크 연결을 주기적으로 확인
setInterval(checkNetworkConnection, 5000);