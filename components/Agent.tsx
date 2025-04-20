import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils';

enum CallStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  CONNECTING = 'CONNECTING',
  FINISHED = 'FINISHED',
}

interface AgentProps {
  userName: string;
}

const Agent = ({ userName }: AgentProps) => {
  const isSpeaking = true;
  const currentCallStatus = CallStatus.FINISHED;
  const messages=[
    'What is your name?',
    'My name is Abdullah Yaqoob, nice to meet you',
  ]

  const lastMessage=messages[messages.length-1]
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
            <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>{lastMessage}</p>
          </div>
          </div>
      )}

      <div className='w-full flex justify-center'>
        {currentCallStatus !== CallStatus.ACTIVE ? (
          <button className='relative btn-call'>
            <span className={cn('absolute animate-ping rounded-full opacity-75', currentCallStatus !== CallStatus.CONNECTING && 'hidden')} />
            <span>{currentCallStatus === CallStatus.INACTIVE || currentCallStatus === CallStatus.FINISHED ? 'Call' : '. . . .'}</span>
          </button>
        ) : (
          <button className='btn-disconnect'>End</button>
        )}
      </div>
    </>
  );
};

export default Agent;
