<template>
                      <div>
                          <article class="w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]">
                            <div class="m-auto text-base py-[18px] px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5">
                              <div class="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl">
                                <div class="group/conversation-turn relative flex w-full min-w-0 flex-col">
                                  <div class="flex-col gap-1 md:gap-3">
                                    <div class="flex max-w-full flex-col flex-grow">
                                      <div class="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words text-start [.text-message+&]:mt-5">
                                            <div class="flex w-full flex-col gap-1 empty:hidden items-end rtl:items-start">
                                              <div class="">
                                                <Skeleton width="93px" height="44px" borderRadius="1.5rem"></Skeleton>
                                              </div>
                                            </div>
                                          </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                          <article class="w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]" dir="auto" data-testid="conversation-turn-3" data-scroll-anchor="true">
                            <div class="m-auto text-base py-[18px] px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5">
                              <div class="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
                                <div class="flex-shrink-0 flex flex-col relative items-end">
                                  <div>
                                    <div class="pt-0">
                                      <Skeleton shape="circle" size="32px"></Skeleton>
                                    </div>
                                  </div>
                                </div>
                                <div class="group/conversation-turn relative flex w-full min-w-0 flex-col agent-turn">
                                  <div class="flex-col gap-1 md:gap-3">
                                    <div class="flex max-w-full flex-col flex-grow">
                                      <div data-message-author-role="chatbot" :data-message-id="'message_id_' + index" dir="auto" class="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words text-start [.text-message+&amp;]:mt-5" data-message-model-slug="gpt-4o">
                                        <div class="flex w-full flex-col gap-1 empty:hidden first:pt-[3px]">
                                          <Skeleton width="10rem" height="30px" borderRadius="1.5rem"></Skeleton>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                          <article class="w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]">
                            <div class="m-auto text-base py-[18px] px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5">
                              <div class="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl">
                                <div class="group/conversation-turn relative flex w-full min-w-0 flex-col">
                                  <div class="flex-col gap-1 md:gap-3">
                                    <div class="flex max-w-full flex-col flex-grow">
                                      <div class="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words text-start [.text-message+&]:mt-5">
                                            <div class="flex w-full flex-col gap-1 empty:hidden items-end rtl:items-start">
                                              <div class="">
                                                <Skeleton width="20rem" height="10rem" borderRadius="1.5rem"></Skeleton>
                                              </div>
                                            </div>
                                          </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                          <article class="w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]" dir="auto" data-testid="conversation-turn-3" data-scroll-anchor="true">
                            <div class="m-auto text-base py-[18px] px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5">
                              <div class="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
                                <div class="flex-shrink-0 flex flex-col relative items-end">
                                  <div>
                                    <div class="pt-0">
                                      <Skeleton shape="circle" size="32px"></Skeleton>
                                    </div>
                                  </div>
                                </div>
                                <div class="group/conversation-turn relative flex w-full min-w-0 flex-col agent-turn">
                                  <div class="flex-col gap-1 md:gap-3">
                                    <div class="flex max-w-full flex-col flex-grow">
                                      <div data-message-author-role="chatbot" :data-message-id="'message_id_' + index" dir="auto" class="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words text-start [.text-message+&amp;]:mt-5" data-message-model-slug="gpt-4o">
                                        <div class="flex w-full flex-col gap-1 empty:hidden first:pt-[3px]">
                                          <Skeleton width="70%" height="5rem" borderRadius="1.5rem"></Skeleton>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                      </div>  
</template>
<script setup>
import Skeleton from 'primevue/skeleton';
</script>
<style>
    
</style>