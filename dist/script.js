const socket = io();

const chat = $('#chat');

socket.on('new user', (data, name)=>{
   socket.name = name;
   data.split('\n').filter((msg) => msg != '').forEach((msg)=>{
      const [chatName, chatData] = msg.split(':');
      if(chatName != name){
         chat.append(
            $('<div>').prop({
               innerHTML : chatData,
               className : 'message stark'
            })
         )
      }else{
         chat.append(
            $('<div>').prop({
               innerHTML : chatData,
               className : 'message parker'
            })
         )
      }
   })
   chat.scrollTop(chat.prop('scrollHeight') - chat.prop('clientHeight'))
})

socket.on('typing', (name)=>{
   const bubble = {};
   for(let i=1; i<=3;i++){
      bubble['typing' + i] = $('<div>').prop({
         className: 'typing typing-'+i
      })
   }

   if(name != socket.name){
      chat.append(
         $('<div>').prop({
            className: 'message stark'
         })
         .append(bubble['typing1'],bubble['typing2'], bubble['typing3'])
      )
   }else{
      chat.append(
         $('<div>').prop({
            className: 'message parker'
         })
         .append(bubble['typing1'],bubble['typing2'], bubble['typing3'])
      )
   }
   chat.scrollTop(chat.prop('scrollHeight') - chat.prop('clientHeight'))
})

socket.on('untyping', (name)=>{
   $(".message.stark").last().remove();
})

//정리 및 추가된 typing div 삭제 필요
//typing 은 상대방만 들어온다는 점을 놓침...

$('#input').on({
   focusin: ()=>{
      socket.emit('typing', socket.name);
   },
   focusout: ()=>{
      socket.emit('untyping', socket.name);
   }
})

$('#frm').submit((e)=>{
   e.preventDefault();
   const message = $('#message');
   if(message.val() != '')
      socket.emit('chat message', message.val());
   message.val('');
})

$('#button').on('click', ()=>{
   $('#frm').submit();
})