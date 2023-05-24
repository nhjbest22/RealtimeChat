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
               className : 'message receive'
            })
         )
      }else{
         chat.append(
            $('<div>').prop({
               innerHTML : chatData,
               className : 'message send'
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
   chat.append(
      $('<div>').prop({
         className: 'typing'
      })
      .append(
         $('<div>').prop(
            {
               className: 'message receive'
            })
      .append(bubble['typing1'],bubble['typing2'], bubble['typing3'])
      )
   )
   chat.scrollTop(chat.prop('scrollHeight') - chat.prop('clientHeight'))
})

socket.on('untyping', (name)=>{
   $("[class=typing]").remove();
})

socket.on('chat message', (data)=>{
   chat.append(
      $('<div>').prop({
         innerHTML: data.msg,
         className: 'message receive',
      })
   )
   $('.message').last().after($('[class=typing]'));
   chat.scrollTop(chat.prop('scrollHeight') - chat.prop('clientHeight'))
})

socket.on('update', (name)=>{
   $('[class=typing]').remove();
})// 코드 구조 수정 필요 (입력중... 삭제를 위한 함수)

$('#message').on({
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
   if(message.val() != ''){
      chat.append(
         $('<div>').prop({
            innerHTML: message.val(),
            className: 'message send'
         })
      )
      socket.emit('chat message', message.val());
   }
   chat.scrollTop(chat.prop('scrollHeight') - chat.prop('clientHeight'))
   message.val('');
})

$('#button').on('click', ()=>{
   $('#frm').submit();
})

// $(async ()=>{ //document.ready 기능
//    const response = await fetch('data/userList');
//    const data = await response.json();
//    const userPannel = $('[class=contracts]');
//    data.forEach((user)=>{
//       userPannel.append(
//          $('<div>').prop({
//             class : 'contract',
//             id : user.userid,
//          }).append(
//             $('<div>').prop({
//                className: `pic.${user.username}`,
//             }),
//             $('<div>').prop({
//                className: 'badge',
//                innerHTML: '12'
//             }),
//             $('<div>').prop({
//                className: 'name',
//                innerHTML: user.username,
//             }),
//             $('<div>').prop({
//                className: 'message',
//                innerHTML: 'test',
//             }),
//          )
//       )
//    })
// })

window.addEventListener('DOMContentLoaded', async()=>{
   const response = await fetch('http://localhost:8080/data/userList');
   const data = await response.json();
   const userPannel = $('[class=contacts]');
   data.forEach((user)=>{
      userPannel.append(
         $('<div>').prop({
            className : 'contact',
            id : user.userid,
         }).append(
            $('<div>').prop({
               className: `pic.${user.username}`,
            }),
            $('<div>').prop({
               className: 'badge',
               innerHTML: '12'
            }),
            $('<div>').prop({
               className: 'name',
               innerHTML: user.username,
            }),
            $('<div>').prop({
               className: 'message',
               innerHTML: 'test',
            }),
         )
      )
   })
});