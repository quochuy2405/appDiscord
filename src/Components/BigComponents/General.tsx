import { TextareaAutosize } from '@mui/material'
import React, { FormEvent, memo, useContext, useMemo, useState, useEffect, useRef } from 'react'
import InviteMemember from '../SmallComponents/InviteMemeber'
import Chatcontent from './../SmallComponents/Chatcontent'
import UserTag from './../SmallComponents/UserTag'
import './styles/General.scss'
import { addDocument } from './../../firebase/service'
import { AuthContext } from './../../Auth/AuthProvider'
import useFireStore from './../../Hooks/useFireStore'
import { ctx } from '../../Context/contextFE'

interface General {
	channelChat?: Array<string>
	dataRoom?: any
}
function General(props: General) {
	const { channelChat, dataRoom } = props
	const [openInviteMemember, setOpenInviteMemember] = useState(false)
	const [messageValue, setMessageValue] = useState<any>()
	const [flagUserInRoom, setflagUserInRoom] = useState(false)
	const appContext = useContext(ctx)
	const { ...user } = useContext<any>(AuthContext)
	useEffect(() => {}, [])
	const onSubmit = (e: FormEvent) => {
		e.preventDefault()

		if (messageValue) {
			addDocument('messages', {
				text: messageValue,
				uid: user?.uid,
				photoURL: user?.photoURL,
				roomId: dataRoom?.id,
				displayName: user?.displayName,
			})
			setMessageValue('')
		}
	}
	const messageCondition = React.useMemo(() => {
		return {
			fieldName: 'roomId',
			operator: '==',
			value: dataRoom?.id,
		}
	}, [dataRoom?.id])
	const membersCondition = React.useMemo(() => {
		return {
			fieldName: 'uid',
			operator: 'in',
			value: dataRoom?.members,
		}
	}, [dataRoom?.members, flagUserInRoom])
	const messages: any = useFireStore('messages', messageCondition)
	const members = useFireStore('users', membersCondition)
	let checkNew = useRef(0)
	useEffect(() => {
		try {
			if (
				messages[messages.length - 1]?.uid !== user?.uid &&
				checkNew.current < messages.length &&
				messages[0]?.uid
			) {
				appContext.messageSound()
			}
			checkNew.current = messages.length
		} catch (error) {}
	}, [messages.length, dataRoom?.id])
	const scrollToBottom = () => {
		var myDiv = document.querySelector<any>('.body-chat-render')
		if (myDiv) myDiv.scrollTop = myDiv.scrollHeight
	}
	useEffect(() => {
		scrollToBottom()

		return () => {
			scrollToBottom()
		}
	}, [messages.length])
	const onChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessageValue(e.target.value)
	}
	return (
		<div className="general">
			<div className="nav-general">
				<InviteMemember
					openInviteMemember={openInviteMemember}
					setOpenInviteMemember={setOpenInviteMemember}
					roomId={dataRoom?.id}
					member={dataRoom?.members}
					setflagUserInRoom={setflagUserInRoom}
					flagUserInRoom={flagUserInRoom}
				/>
				<div className="general-channel-name">
					<p>{dataRoom?.name}</p>
				</div>
				<div className="body-switch">
					<p className="title-channel sound">
						<a data-toggle="collapse" href="#listGeneral" aria-expanded="true">
							Kênh chung <i className="fad fa-chevron-right"></i>
						</a>
					</p>

					<ul className="collapse listGeneraltag show" id="listGeneral">
						<li className="tag-channel sound">#Kênh học tập</li>
						<li className="tag-channel sound">#Kênh giải trí</li>
						<li className="tag-channel sound">#Kênh tán chuyện</li>
						<li className="tag-channel sound">#Kênh làm việc</li>
					</ul>
				</div>
			</div>
			<div className="body-general">
				<div className="nav-body-general">
					<p>#Chung</p>
					<div className="nav-body-right">
						<p className="icon-videocall">
							<i className="fas fa-video"></i>
						</p>
						<p className="btn-addmembes sound" onClick={() => setOpenInviteMemember(true)}>
							Thêm bạn bè
						</p>
					</div>
				</div>
				<div className="body-chat">
					<div className="body-chat-render">
						{messages?.map(
							(item: any, index: any) =>
								item?.uid && (
									<Chatcontent
										messages={messages}
										index={index}
										key={index}
										username={item?.displayName}
										Userid={item?.uid}
										avata={item?.photoURL}
										text={item?.text}
										date_time={item?.createdAt?.seconds}
									/>
								)
						)}

						<div className="chat-form ">
							<form className="form-chat" onSubmit={onSubmit}>
								<TextareaAutosize
									maxRows={4}
									onChange={(e) => onChangeMessage(e)}
									aria-label="empty textarea"
									placeholder="Nhắn tin"
									value={messageValue}
									className="input-chat"
									id="chatSend"
									style={{ whiteSpace: 'pre-line' }}
									onKeyPress={(e: any) => {
										if (e.charCode === 13 && !e.shiftKey) {
											onSubmit(e)
										}
									}}
									name="chatContent"
								/>
								<button className="btn-submit sound" type="submit">
									<i className="fad fa-paper-plane"></i>
								</button>
							</form>
						</div>
					</div>
					<div className="nav-body-chat">
						<p>Trực tuyến - 1</p>
						<ul>
							<UserTag displayName={user?.displayName} photoURL={user?.photoURL} />
						</ul>
						<p> Mọi người - {members.length || '0'}</p>
						<ul>
							{members?.map(
								(item: any, index) =>
									item.id && (
										<UserTag
											key={index}
											displayName={item?.displayName}
											photoURL={item?.photoURL}
										/>
									)
							)}
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(General)
