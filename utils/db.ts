import Dexie, {type Table} from 'dexie';

export class Database extends Dexie {
    history!: Table<HistoryItem>
    tab!: Table<TabItem>

    constructor() {
        super('ai')
        this.version(4).stores({
            history: '++id, session, type, role, content, src',
            tab: '++id, label'
        })
        // this.version(5).upgrade()
    }

    getLatestTab() {
        return DB.tab.orderBy('id').last();
    }

    getTabs() {
        return DB.tab.limit(100).reverse().toArray()
    }

    async getHistory(session: number) {
        const arr = await DB.history.where('session').equals(session).limit(100).toArray()
        arr.forEach(i => {
            if (i.type === 'image' && i.src instanceof Blob) {
                URL.revokeObjectURL(i.content)
                i.content = URL.createObjectURL(i.src)
            }
        })
        return arr
    }

    addTab(label: string) {
        return DB.tab.add({label})
    }

    deleteTabAndHistory(id: number) {
        return DB.transaction('rw', DB.tab, DB.history, async () => {
            await DB.tab.delete(id)
            await DB.history.where('session').equals(id).delete()
        })
    }
}

export const DB = new Database();

export const initialSettings = {
    openaiKey: '',
    image_steps: 20
}

export type Settings = typeof initialSettings

export const textGenModels: Model[] = [{
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    type: 'chat'
}, {
    id: 'gpt-3.5-turbo',
    name: 'ChatGPT-3.5-turbo',
    provider: 'openai',
    endpoint: 'chat/completions',
    type: 'chat'
}, {
   id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
   name: 'DeepSeek-R1-qwen:32b',
   provider: 'workers-ai',
   type: 'chat'
}, {
    id: '@cf/meta/llama-4-scout-17b-16e-instruct',
    name: 'Llama-4-scout-17b-16e-instruct',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/meta/llama-3.2-3b-instruct',
    name: 'Llama3.2-3b-instruct',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/meta/llama-3.1-8b-instruct',
    name: 'Llama3.1-8b-instruct',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/meta/llama-3-8b-instruct',
    name: 'llama-3-8b-instruct',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/microsoft/phi-2',
    name: 'phi-2',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/qwen/qwen1.5-14b-chat-awq',
    name: 'qwen1.5-14b-chat-awq',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/openchat/openchat-3.5-0106',
    name: 'openchat-3.5-0106',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/google/gemma-7b-it',
    name: 'gemma-7b-it',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@cf/google/gemma-7b-it-lora',
    name: 'gemma-7b-it-lora',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/thebloke/openhermes-2.5-mistral-7b-awq',
    name: 'openhermes-2.5-mistral-7b-awq',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/thebloke/neural-chat-7b-v3-1-awq',
    name: 'neural-chat-7b-v3-1-awq',
    provider: 'workers-ai',
    type: 'chat'
}, {
    id: '@hf/nexusflow/starling-lm-7b-beta',
    name: 'starling-lm-7b-beta',
    provider: 'workers-ai',
    type: 'chat'
}]

export const imageGenModels: Model[] = [{
    id: '@cf/lykon/dreamshaper-8-lcm',
    name: 'dreamshaper-8-lcm',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/black-forest-labs/flux-1-schnell',
    name: 'flux-1-schnell',
    provider: 'worker-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/runwayml/stable-diffusion-v1-5-inpainting',
    name: 'stable-diffusion-v1-5-inpainting',
    provider: 'worker-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    name: 'stable-diffusion-xl-base-1.0',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}, {
    id: '@cf/bytedance/stable-diffusion-xl-lightning',
    name: 'stable-diffusion-xl-lightning',
    provider: 'workers-ai-image',
    type: 'text-to-image'
}]

export const models: Model[] = [...textGenModels, ...imageGenModels]
