import {
  Configuration,
  OpenAIApi
} from 'https://cdn.skypack.dev/openai';
const speechContent = window.speechSynthesis;

let lang_code = "ko-KR";

const form = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('#text-input');
const messageContainer = document.querySelector('#message-container');
const downloadButton = document.querySelector('.download-button');

let allMessages = [];

//엔터키로 메시지 전송
messageInput.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    sendButton.click();
  }
});

//메시지 전송 버튼 클릭시 메시지 전송
sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  
  if (message.trim() !== '') {
    displayMessage(message, 'user-message');

    sendMessageToAI(message);
    
    messageInput.value = '';
  } else {
    alert('Please enter a message.');
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
    apiKey: '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-',
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

//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
