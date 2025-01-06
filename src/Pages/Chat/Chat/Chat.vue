<script setup>
const props = defineProps({
	chatId: String,
})

import { useEmitter } from '@nguyenshort/vue3-mitt'
import Cookies from 'js-cookie'
import {
	Bot,
	Copy,
	Pencil,
	RotateCw,
	ThumbsDown,
	ThumbsUp,
} from 'lucide-vue-next'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import api from '../../../http/axiosConfig.js'
import router from '../../../router/index.js'
import HeaderBar from '../../components/HeaderBar.vue'
import InputForm from './components/InputForm.vue'
import Markdown from './components/Markdown.vue'
import SkeletonLoadMessages from './components/SkeletonLoadMessages.vue'

const emitter = useEmitter()
const toast = useToast()

const creatingMessage = ref(false)
const firstMessage = ref(false)
const firstTextMessage = ref('')

const content = ref('')
const messages = ref([])
const editMessagePanel = ref([])
const editedMessage = ref('')

const sendMessage = addMessage => {
	if (!addMessage) {
		if (content.value.trim()) {
			messages.value.push({
				role: 'USER',
				message: content.value,
			})
		}
	}
}

let abortController = null
const sendRequestCompletions = async addMessage => {
	creatingMessage.value = true
	abortController = new AbortController()

	sendMessage(addMessage)

	const messagesWithoutLast = messages.value.slice(0, -1)
	const bodyData = firstMessage.value
		? {
				chatHistory: [],
				message: firstTextMessage.value,
		  }
		: {
				chatHistory: messagesWithoutLast,
				message: content.value,
		  }

	content.value = ''

	try {
		const response = await fetch(
			`${import.meta.env.APP_API_URL}/chat/completions`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${Cookies.get('token')}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(bodyData),
				signal: abortController.signal,
			}
		)

		const reader = response.body.getReader()
		const decoder = new TextDecoder('utf-8')
		let partialContent = ''

		// Прокрутка страницы при получении данных
		const scrollToBottom = () => {
			const chatContainer = document.querySelector('.chat-container')
			chatContainer.scrollTop = chatContainer.scrollHeight
		}

		const assistantMessage = { role: 'CHATBOT', message: '' }
		messages.value.push(assistantMessage)

		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			partialContent += decoder.decode(value, { stream: true })
			const messagesArray = partialContent.split(/\r?\ndata: /g)
			partialContent = messagesArray.pop()

			for (let msg of messagesArray) {
				try {
					const cleanMsg = msg.trim().replace(/^data:\s*/, '')
					const jsonData = JSON.parse(cleanMsg)
					assistantMessage.message += jsonData.text
					messages.value = [...messages.value] // Обновление массива сообщений
					scrollToBottom()
				} catch (error) {
					console.warn('Невалидный JSON, пропуск фрагмента:', msg.trim())
				}
			}
		}
	} catch (e) {
	} finally {
		setTimeout(() => {
			firstMessage.value = false
		}, 5000)
		creatingMessage.value = false
		// Остановка прокрутки после завершения запроса
		const chatContainer = document.querySelector('.chat-container')
		chatContainer.scrollTop = chatContainer.scrollHeight // Убедитесь, что последний элемент виден

		try {
			const response = await api.put(
				`${import.meta.env.APP_API_URL}/chat/updateConversations`,
				{
					chatId: props.chatId,
					chatHistory: messages.value,
				}
			)
		} catch (e) {}
	}
}

function generateNewMessage(index) {
	const previousMessage = index > 0 ? messages.value[index - 1].message : null
	messages.value.splice(index + 0)
	content.value = previousMessage
	sendRequestCompletions(true)
}

function editMessage(index) {
	editedMessage.value = messages.value[index].message // Запоминаем исходное сообщение
	editMessagePanel.value[index] = true
}

function updateUserMessage(index) {
	if (
		editedMessage.value.trim() &&
		editedMessage.value !== messages.value[index].message
	) {
		messages.value[index].message = editedMessage.value // Обновляем сообщение
		editMessagePanel.value[index] = false // Закрываем панель редактирования
		messages.value.splice(index + 1)
		content.value = editedMessage.value
		editedMessage.value = '' // Сбрасываем отредактированное сообщение
		sendRequestCompletions(true)
	}
}

const isSendButtonDisabled = computed(() => {
	return (
		editedMessage.value.trim() === '' ||
		editedMessage.value ===
			messages.value.find((_, idx) => editMessagePanel.value[idx]).message
	)
})

function closeEditPanel() {
	editMessagePanel.value = messages.value.map(() => false)
}

function stopRequest() {
	if (abortController) {
		abortController.abort() // Останавливаем запрос
	}
}

function copyText(text) {
	// Современный способ через Clipboard API
	navigator.clipboard
		.writeText(text)
		.then(() => {
			console.log('Текст скопирован в буфер обмена!')
		})
		.catch(err => {
			console.error('Не удалось скопировать текст:', err)
		})
}

onMounted(() =>
	emitter.on('addChatContents', data => {
		firstMessage.value = true
		firstTextMessage.value = data.data.message
		messages.value.push({
			role: data.data.role,
			message: data.data.message,
		})
		sendRequestCompletions(false)
	})
)

onMounted(async () => {
	closeEditPanel()
	setTimeout(async () => {
		if (!firstMessage.value) {
			try {
				const response = await api.post(
					`${import.meta.env.APP_API_URL}/chat/conversations`,
					{
						chatId: props.chatId,
					}
				)

				if (response.status === 200) {
					messages.value = JSON.parse(response.data.data.chatHistory)
				} else {
					return await router.push({ name: 'NewChat' })
				}
			} catch (error) {
				const statusCode = error.response.status

				if (statusCode === 404) {
					await router.push({ name: 'NewChat' })
				}
			}
		}

		watch(
			() => props.chatId, // Следим за значением параметра маршрута
			async () => {
				closeEditPanel()
				try {
					if (!firstMessage.value) {
						messages.value = []

						const response = await api.post(
							`${import.meta.env.APP_API_URL}/chat/conversations`,
							{
								chatId: props.chatId,
							}
						)

						if (response.status === 200) {
							messages.value = JSON.parse(response.data.data.chatHistory)
						} else {
							return await router.push({ name: 'NewChat' })
						}
					}
				} catch (error) {
					const statusCode = error.response.status

					if (statusCode === 404) {
						await router.push({ name: 'NewChat' })
					}
				}
			}
		)
	}, 150)
})

const showSuccess = () => {
	toast.add({
		severity: 'success',
		summary: 'Успешно',
		detail: 'Message Content',
		life: 3000,
	})
}

onUnmounted(() => emitter.off('addChatContents'))
</script>

<template>
	<Toast />

	<div
		class="relative h-screen bg-[#212121] flex w-full overflow-hidden transition-colors z-0"
	>
		<div
			class="relative flex h-full max-w-full flex-1 flex-col overflow-hidden"
		>
			<HeaderBar />

			<main
				class="relative h-full w-full flex-1 overflow-auto transition-width"
			>
				<div
					class="composer-parent flex h-full flex-col focus-visible:outline-0"
				>
					<div class="flex-1 overflow-hidden @container/thread">
						<div
							class="h-full overflow-auto chat-container"
							id="chat-container"
						>
							<div class="flex flex-col text-sm md:pb-9">
								<div>
									<div>
										<div class="" v-if="messages.length === 0">
											<SkeletonLoadMessages />
										</div>
										<div v-else>
											<div
												v-for="(message, index) in messages"
												:key="index"
												:data-row-key="'message_id_' + index"
											>
												<div v-if="message.role === 'USER'">
													<article
														class="edit-message-container w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
													>
														<h5 class="sr-only">Вы сказали:</h5>
														<div
															class="m-auto text-base py-[18px] px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5"
														>
															<div
																class="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl"
															>
																<div
																	class="group/conversation-turn relative flex w-full min-w-0 flex-col"
																>
																	<div class="flex-col gap-1 md:gap-3">
																		<div
																			class="flex max-w-full flex-col flex-grow"
																		>
																			<div>
																				<div v-if="!editMessagePanel[index]">
																					<div
																						class="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words text-start [.text-message+&]:mt-5"
																					>
																						<div
																							class="flex w-full flex-col gap-1 empty:hidden items-end rtl:items-start"
																						>
																							<div
																								class="relative max-w-[var(--user-chat-width,70%)] rounded-3xl bg-[#2f2f2f] px-5 py-2.5"
																							>
																								<div
																									class="whitespace-pre-wrap"
																								>
																									<div class="text-white">
																										{{ message.message }}
																									</div>
																								</div>

																								<div
																									class="hidden-block-edit-message absolute bottom-0 right-full top-0 -mr-3.5 pr-5 pt-1"
																								>
																									<span class="">
																										<button
																											@click="
																												editMessage(
																													index,
																													message.message
																												)
																											"
																											v-tooltip.bottom="{
																												value: $t(
																													'tooltip.edit_message'
																												),
																												dt: {
																													background: '#0d0d0d',
																													color: '#c5d0de',
																													'max.width': 'auto',
																												},
																											}"
																											aria-label="Редактировать сообщение"
																											class="flex h-9 w-9 items-center justify-center rounded-full text-token-text-secondary transition hover:bg-[#2e2e2e]"
																										>
																											<Pencil
																												color="#b4b4b4"
																												size="16px"
																											/>
																										</button>
																									</span>
																								</div>
																							</div>
																						</div>
																					</div>
																				</div>

																				<div v-else>
																					<div
																						class="rounded-3xl bg-[#303030] px-3 py-3"
																					>
																						<div
																							class="m-2 max-h-[25dvh] overflow-auto"
																						>
																							<div class="grid">
																								<textarea
																									v-model="editedMessage"
																									rows="3"
																									class="col-start-1 col-end-2 row-start-1 row-end-2 p-0 m-0 w-full overflow-hidden resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0"
																								></textarea>
																							</div>
																						</div>
																						<div class="flex justify-end gap-2">
																							<div
																								class="flex items-center justify-center"
																							>
																								<Button
																									@click="closeEditPanel"
																									:label="
																										$t('button.button_cancel')
																									"
																									severity="secondary"
																									size="small"
																									rounded
																								/>
																							</div>
																							<Button
																								@click="
																									updateUserMessage(
																										index,
																										messages[index].message
																									)
																								"
																								:label="
																									$t('button.button_send')
																								"
																								:disabled="isSendButtonDisabled"
																								severity="contrast"
																								size="small"
																								rounded
																							/>
																						</div>
																					</div>
																				</div>
																			</div>

																			<!--Редактор сообщения-->
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</article>
												</div>

												<div v-if="message.role === 'CHATBOT'">
													<article
														class="article-container w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
														dir="auto"
														data-testid="conversation-turn-3"
														data-scroll-anchor="true"
													>
														<h6 class="sr-only">CHATBOT сказал:</h6>
														<div
															class="m-auto text-base py-[18px] px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5"
														>
															<div
																class="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"
															>
																<div
																	class="flex-shrink-0 flex flex-col relative items-end"
																>
																	<div>
																		<div class="pt-0">
																			<div
																				style="
																					outline: solid 1px hsl(0, 0%, 25.9%);
																				"
																				class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
																			>
																				<div
																					class="relative p-1 rounded-sm flex items-center justify-center bg-red-5100 h-8 w-8"
																				>
																					<Bot color="#b4b4b4" size="20px" />
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
																<div
																	class="group/conversation-turn relative flex w-full min-w-0 flex-col agent-turn"
																>
																	<div class="flex-col gap-1 md:gap-3">
																		<div
																			class="flex max-w-full flex-col flex-grow"
																		>
																			<div
																				data-message-author-role="chatbot"
																				:data-message-id="'message_id_' + index"
																				dir="auto"
																				class="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words text-start [.text-message+&amp;]:mt-5"
																				data-message-model-slug="gpt-4o"
																			>
																				<div
																					class="flex w-full flex-col gap-1 empty:hidden first:pt-[3px]"
																				>
																					<div
																						class="markdown prose w-full break-words dark:prose-invert dark"
																					>
																						<Markdown :mark="message.message" />
																					</div>
																				</div>
																			</div>
																		</div>
																		<div
																			class="mb-2 flex gap-3 empty:hidden -ml-2"
																		>
																			<div
																				class="hidden-block items-center justify-start rounded-xl p-1 z-10 -mt-1 bg-token-main-surface-primary screen-arch:mt-1 md:absolute"
																			>
																				<div class="flex items-center mt-1">
																					<span>
																						<button
																							@click="generateNewMessage(index)"
																							v-tooltip.bottom="{
																								value: $t('tooltip.new_answer'),
																								dt: {
																									background: '#0d0d0d',
																									color: '#c5d0de',
																									'max.width': 'auto',
																								},
																							}"
																							class="group flex items-center justify-center whitespace-nowrap transition ease-in-out disabled:cursor-not-allowed border border-transparent focus-visible:outline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-volcanic-700 group/icon-button p-0 h-7 w-7 rounded hover:bg-[#2e2e2e]"
																							type="button"
																						>
																							<div class="flex items-center">
																								<RotateCw
																									color="#b4b4b4"
																									size="16px"
																								/>
																							</div>
																						</button>
																					</span>
																					<span>
																						<button
																							@click="copyText(message.message)"
																							v-tooltip.bottom="{
																								value: $t('tooltip.copy'),
																								dt: {
																									background: '#0d0d0d',
																									color: '#c5d0de',
																									'max.width': 'auto',
																								},
																							}"
																							class="group flex items-center justify-center whitespace-nowrap transition ease-in-out disabled:cursor-not-allowed border border-transparent focus-visible:outline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-volcanic-700 group/icon-button p-0 h-7 w-7 rounded hover:bg-[#2e2e2e]"
																							type="button"
																						>
																							<div class="flex items-center">
																								<Copy
																									color="#b4b4b4"
																									size="16px"
																								/>
																							</div>
																						</button>
																					</span>
																					<span>
																						<button
																							@click="showSuccess"
																							v-tooltip.bottom="{
																								value: $t(
																									'tooltip.good_answer'
																								),
																								dt: {
																									background: '#0d0d0d',
																									color: '#c5d0de',
																									'max.width': 'auto',
																								},
																							}"
																							class="group flex items-center justify-center whitespace-nowrap transition ease-in-out disabled:cursor-not-allowed border border-transparent focus-visible:outline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-volcanic-700 group/icon-button p-0 h-7 w-7 rounded hover:bg-[#2e2e2e]"
																							type="button"
																						>
																							<div class="flex items-center">
																								<ThumbsUp
																									color="#b4b4b4"
																									size="16px"
																								/>
																							</div>
																						</button>
																					</span>
																					<span>
																						<button
																							v-tooltip.bottom="{
																								value: $t('tooltip.bad_answer'),
																								dt: {
																									background: '#0d0d0d',
																									color: '#c5d0de',
																									'max.width': 'auto',
																								},
																							}"
																							class="group flex items-center justify-center whitespace-nowrap transition ease-in-out disabled:cursor-not-allowed border border-transparent focus-visible:outline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-volcanic-700 group/icon-button p-0 h-7 w-7 rounded hover:bg-[#2e2e2e]"
																							type="button"
																						>
																							<div class="flex items-center">
																								<ThumbsDown
																									color="#b4b4b4"
																									size="16px"
																								/>
																							</div>
																						</button>
																					</span>
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</article>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div
						class="md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent w-full"
					>
						<div
							class="m-auto text-base px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5"
						>
							<div
								class="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl"
							>
								<InputForm
									v-model:content="content"
									v-model:creatingMessage="creatingMessage"
									:sendRequest="sendRequestCompletions"
									:stopRequest="stopRequest"
								/>
							</div>
						</div>

						<div
							class="relative w-full px-2 py-2 text-center text-xs text-neutral-500 empty:hidden md:px-[60px]"
						>
							<div class="min-h-4">
								<div>
									{{ $t('nc_footer_text') }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	</div>
</template>

<style scoped>
/* Блок по умолчанию скрыт */
.hidden-block,
.hidden-block-edit-message {
	display: none;
}

/* Для десктопов показываем блоки только при наведении */
.article-container:hover .hidden-block,
.edit-message-container:hover .hidden-block-edit-message {
	display: flex; /* Или другой подходящий стиль, чтобы блок стал видимым */
}

/* Для мобильных устройств блоки всегда видимы */
@media (max-width: 768px) {
	.hidden-block,
	.hidden-block-edit-message {
		display: flex !important; /* Используем !important, чтобы переопределить другие стили */
	}
}
</style>
