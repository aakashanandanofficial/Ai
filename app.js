const $ = (selector) => document.querySelector(selector);
const welcomeView = $('#welcome-view'), chatView = $('#chat-view'), messagesEl = $('#messages');
let history = [], subject = '', busy = false, installPrompt = null;
const neocitiesPreview = window.location.hostname.endsWith('.neocities.org');

function showChat(title = 'Let’s figure it out.') {
  welcomeView.hidden = true; chatView.hidden = false; $('#chat-title').textContent = title;
  $('#chat-subtitle').textContent = subject ? `A friendly ${subject.toLowerCase()} tutor is here to help.` : 'Ask a question and I’ll walk you through it.';
  window.scrollTo(0, 0);
}
function showWelcome() { subject = ''; history = []; messagesEl.innerHTML = ''; welcomeView.hidden = false; chatView.hidden = true; $('#crumb-subject').textContent = 'All subjects'; document.querySelectorAll('.side-link').forEach((b,i)=>b.classList.toggle('active',i===0)); }
function addMessage(role, content, isTyping = false) {
  const row = document.createElement('div'); row.className = `message ${role}`;
  if (role === 'assistant') { const mark = document.createElement('div'); mark.className = 'tutor-mark'; mark.textContent = '✳'; row.append(mark); }
  const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = content; if (isTyping) bubble.classList.add('typing'); row.append(bubble); messagesEl.append(row); messagesEl.scrollTop = messagesEl.scrollHeight; return bubble;
}
async function ask(question) {
  if (!question.trim() || busy) return;
  if (!history.length) showChat('Let’s figure it out.');
  history.push({role:'user',content:question.trim()}); addMessage('user',question.trim());
  if (neocitiesPreview) {
    addMessage('assistant','This is the public StudySpark preview. Its AI needs a model connected to an online server, so questions cannot be answered on this Neocities page yet.');
    return;
  }
  const waiting = addMessage('assistant','Thinking it through…',true); busy = true;
  document.querySelectorAll('.send-btn').forEach(b=>b.disabled=true);
  try {
    const response = await fetch(new URL('api/chat', window.location.href),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history})});
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('This website has no AI server connected. For your local Ollama tutor, open http://localhost:3000 on the same computer where Ollama is running, using Start StudySpark.bat. A GitHub-hosted copy needs its own online AI server.');
    }
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'I couldn’t connect right now. Please try again.');
    waiting.classList.remove('typing'); waiting.textContent = data.answer; history.push({role:'assistant',content:data.answer});
  } catch(error) { waiting.classList.remove('typing'); waiting.textContent = `I hit a snag: ${error.message}`; history.pop(); }
  finally { busy = false; document.querySelectorAll('.send-btn').forEach(b=>b.disabled=false); messagesEl.scrollTop = messagesEl.scrollHeight; $('#followup-input').focus(); }
}
$('#followup-form').addEventListener('submit',e=>{e.preventDefault();const input=$('#followup-input');ask(input.value);input.value='';});
$('#followup-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.currentTarget.form.requestSubmit();}});
document.querySelectorAll('.subject-card[data-subject]').forEach(button=>button.addEventListener('click',()=>{
  subject=button.dataset.subject; history=[]; messagesEl.innerHTML=''; $('#crumb-subject').textContent=subject;
  showChat(subject==='Any subject'?'What would you like to learn?':`Let’s explore ${subject}.`);
  $('#followup-input').placeholder=subject==='Any subject'?'Ask a question about any subject...':`Ask your ${subject.toLowerCase()} question...`;
  $('#followup-input').focus();
}));
document.querySelectorAll('.side-link').forEach(button=>button.addEventListener('click',()=>{
  subject=button.dataset.subject; document.querySelectorAll('.side-link').forEach(b=>b.classList.toggle('active',b===button)); $('#sidebar').classList.remove('open');
  if(subject){history=[];messagesEl.innerHTML='';$('#crumb-subject').textContent=subject;showChat(`Let’s explore ${subject}.`);$('#followup-input').placeholder=`Ask your ${subject.toLowerCase()} question...`;$('#followup-input').focus();}
  else showWelcome();
}));
$('#new-chat').addEventListener('click',()=>{showWelcome();$('#sidebar').classList.remove('open');});
$('#back-button').addEventListener('click',showWelcome);
$('#menu-toggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install-btn').hidden=false;});
$('#install-btn').addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#install-btn').hidden=true;});
if('serviceWorker' in navigator && window.location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
