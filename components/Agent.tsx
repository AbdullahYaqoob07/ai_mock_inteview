"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.action';

enum CallStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  CONNECTING = 'CONNECTING',
  FINISHED = 'FINISHED',
}

interface AgentProps {
  userName: string;
}

interface SavedMessasge {
  role: 'user' |'system'|'assistant'
  content: string
}
const Agent = ({ userName, userId , type,interviewId,questions}: AgentProps) => {


  const router=useRouter()
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCallStatus, setCurrentCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessasge[]>([]);
    
  useEffect(()=>{
    const onCallStart=()=> setCurrentCallStatus(CallStatus.ACTIVE)
    const onCallEnd=()=> setCurrentCallStatus(CallStatus.FINISHED)
    const onMessage=(message:Message)=>{
      if(message.type==='transcript'&&message.transcriptType==='final'){
        const newMessage={role:message.role,content:message.transcript}
        setMessages((prev=>[...prev,newMessage]))
    }
  }
  const onSpeechStart=()=>setIsSpeaking(true)
  const onSpeechEnd=()=>setIsSpeaking(false)
  const onError=(error:Error)=>console.log("Error",error)

  vapi.on('call-start',onCallStart)
  vapi.on('call-end',onCallEnd)
  vapi.on('message',onMessage)
  vapi.on('speech-start',onSpeechStart)
  vapi.on('speech-end',onSpeechEnd)
  vapi.on('error',onError)
  return()=>{
    vapi.off('call-start',onCallStart)
    vapi.off('call-end',onCallEnd)
    vapi.off('message',onMessage)
    vapi.off('speech-start',onSpeechStart)
    vapi.off('speech-end',onSpeechEnd)
    vapi.off('error',onError)
  }
},[])
// eslint-disable-next-line react-hooks/exhaustive-deps
const handleGenerateFeedback=async(messages:SavedMessasges[])=>{

  console.log("Generating feedback...")
  const {success,feedbackId:id}=await createFeedback({
    interviewId:interviewId!,
    userId:userId!,
    transcript:messages
  })
  if(success&&id)
  {
    router.push(`/interview/${interviewId}/feedback/`)
  }
  else{
    console.log("Error generating feedback")
    router.push('/')
  }
}

useEffect(()=>{
  if(currentCallStatus===CallStatus.FINISHED){
    if(type==='generate'){
    router.push('/')
  }
  else{
    handleGenerateFeedback(messages)
  }
  }
},[messages, currentCallStatus, type, userId, router, handleGenerateFeedback])

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleCall=async()=>{
  setCurrentCallStatus(CallStatus.CONNECTING)
  if(type==='generate'){
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,{
      variableValues:{
        userName:userName,
        userid:userId,
  }

  
})
}
else{
  let formattedQuestions=''
  if(questions){
    formattedQuestions=questions.map((question)=>(`-${question}`)).join('\n')

  }
  await vapi.start(interviewer,{
    variableValues:{
      questions:formattedQuestions
    }
  })
}
}

const handleDisconnect=async()=>{
  setCurrentCallStatus(CallStatus.FINISHED)
  await vapi.stop()

}
const isCallInactiveorFinished=currentCallStatus===CallStatus.INACTIVE||currentCallStatus===CallStatus.FINISHED
const latestMessage=messages[messages.length-1]?.content
  
  return (
    <>
      <div className='call-view'>
        <div className='card-interviewer'>
          <div className='avatar'>
            <Image src="/ai-avatar.png" alt="AI Avatar" width={65} height={54} className='object-cover' />
            {isSpeaking && <span className='animate-speak' />}
          </div>
          <h3>AI interviewer</h3>
        </div>

        <div className='card-border'>
          <div className='card-content'>
            <Image src="/user-avatar.png" alt="User Avatar" width={540} height={540} className='object-cover rounded-full size-[120px]' />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length>0&&(
        <div className='transcript-border'>
          <div className='transcript'>
            <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>{latestMessage}</p>
          </div>
          </div>
      )}

      <div className='w-full flex justify-center'>
        {currentCallStatus !== CallStatus.ACTIVE ? (
          <button className='relative btn-call' onClick={handleCall}>
            <span className={cn('absolute animate-ping rounded-full opacity-75', currentCallStatus !== CallStatus.CONNECTING && 'hidden')} />
            <span>{isCallInactiveorFinished ? 'Call' : '. . . '}</span>
          </button>
        ) : (
          <button className='btn-disconnect' onClick={handleDisconnect}>End</button>
        )}
      </div>
    </>
  );
};

export default Agent;