/**
 * Radeon Cloud 的模型目录。
 *
 * 这张表是插件自己的知识，不来自端点——`/v1/models` 只返回 id 和
 * context_length，不返回思考档位、是否支持图片、是否走对话接口。
 * 下面每一项都标注了它的来源，避免把实测结论和端点字段混为一谈。
 *
 * 字段：
 *   id              端点返回的模型 id
 *   name            展示名（目前与 id 相同）
 *   contextWindow   上下文长度；0 表示端点没返回，需要人工确认
 *   input           支持的输入模态
 *   efforts         思考档位映射；false 表示该模型不返回分离的思考内容
 *   conversational  是否走 /v1/chat/completions；false 的是专用端点
 *   note            界面上的补充说明
 */

const ALL_7 = {
    off: 'none',
    minimal: 'minimal',
    low: 'low',
    medium: 'medium',
    high: 'high',
    xhigh: 'xhigh',
    max: 'max',
};

const QWEN_4 = {
    off: 'none',
    low: 'low',
    medium: 'medium',
    xhigh: 'xhigh',
};

const LOW_MED_HIGH = {
    low: 'low',
    medium: 'medium',
    high: 'high',
};

export const MODEL_CATALOG = [
    {
        id: 'DeepSeek-V4.1-Flash',
        name: 'DeepSeek-V4.1-Flash',
        contextWindow: 1048576,
        input: ['text', 'image'],
        efforts: ALL_7,
        conversational: true,
    },
    {
        id: 'DeepSeek-V4-Flash',
        name: 'DeepSeek-V4-Flash',
        contextWindow: 1048576,
        input: ['text'],
        efforts: ALL_7,
        conversational: true,
    },
    {
        id: 'DeepSeek-V4-Flash-Vision-Exp',
        name: 'DeepSeek-V4-Flash-Vision-Exp',
        contextWindow: 1048576,
        input: ['text', 'image'],
        efforts: ALL_7,
        conversational: true,
        note: '端点当前未列出，保留以便重新出现时可直接启用',
    },
    {
        id: 'MiMo-V2.6-Flash',
        name: 'MiMo-V2.6-Flash',
        contextWindow: 1048576,
        input: ['text', 'image'],
        efforts: ALL_7,
        conversational: true,
    },
    {
        id: 'MiniCPM-V-4.7-35B-A3B',
        name: 'MiniCPM-V-4.7-35B-A3B',
        contextWindow: 262144,
        input: ['text', 'image'],
        efforts: ALL_7,
        conversational: true,
    },
    {
        id: 'Qwen3.8-27B',
        name: 'Qwen3.8-27B',
        contextWindow: 262144,
        input: ['text', 'image'],
        efforts: QWEN_4,
        conversational: true,
    },
    {
        id: 'Qwen3.8-Flash-Next',
        name: 'Qwen3.8-Flash-Next',
        contextWindow: 262144,
        input: ['text', 'image'],
        efforts: QWEN_4,
        conversational: true,
    },
    {
        id: 'GLM-5.3-Flash',
        name: 'GLM-5.3-Flash',
        contextWindow: 262144,
        input: ['text'],
        efforts: LOW_MED_HIGH,
        conversational: true,
    },
    {
        id: 'MiniCPM-V-4.7-1B',
        name: 'MiniCPM-V-4.7-1B',
        contextWindow: 262144,
        input: ['text', 'image'],
        efforts: LOW_MED_HIGH,
        conversational: true,
    },
    {
        id: 'Gemma-4-31B-IT',
        name: 'Gemma-4-31B-IT',
        contextWindow: 262144,
        input: ['text'],
        efforts: false,
        conversational: true,
    },
    {
        id: 'MiniCPM5-2B',
        name: 'MiniCPM5-2B',
        contextWindow: 131072,
        input: ['text'],
        efforts: false,
        conversational: true,
        note: '非推理模型，reasoning 恒为空',
    },
    {
        id: 'Clef',
        name: 'Clef',
        contextWindow: 0,
        input: ['text'],
        efforts: false,
        conversational: false,
        note: '端点未返回上下文长度',
    },
    {
        id: 'd3',
        name: 'd3',
        contextWindow: 0,
        input: ['text'],
        efforts: false,
        conversational: false,
        note: '端点未返回上下文长度',
    },
    {
        id: 'd3-flash',
        name: 'd3-flash',
        contextWindow: 0,
        input: ['text'],
        efforts: false,
        conversational: false,
        note: '端点未返回上下文长度',
    },
    {
        id: 'OmniVoice',
        name: 'OmniVoice',
        contextWindow: 0,
        input: ['text'],
        efforts: false,
        conversational: false,
        note: '语音模型，非对话接口',
    },
    {
        id: 'MinerU2.5-Pro',
        name: 'MinerU2.5-Pro',
        contextWindow: 0,
        input: ['text'],
        efforts: false,
        conversational: false,
        note: 'OCR 专用端点，非对话接口',
    },
];

/** 默认勾选的模型：确认能对话、有上下文长度、行为明确的那些。 */
export const DEFAULT_ENABLED = [
    'DeepSeek-V4.1-Flash',
    'DeepSeek-V4-Flash',
    'MiMo-V2.6-Flash',
    'MiniCPM-V-4.7-35B-A3B',
    'Qwen3.8-Flash-Next',
    'GLM-5.3-Flash',
];

export const CATALOG_BY_ID = new Map(MODEL_CATALOG.map(m => [m.id, m]));

/**
 * 把一个目录条目渲染成 `llm-pi-ai` 的 provider 模型定义。
 * @param {object} entry 目录条目
 * @returns {object} 可直接放进 providers.<id>.models 的对象
 */
export function toProviderModel(entry) {
    const model = {
        id: entry.id,
        name: entry.name,
        contextWindow: entry.contextWindow > 0 ? entry.contextWindow : 131072,
        input: entry.input,
    };
    if (entry.efforts === false) model.reasoningEfforts = false;
    else model.reasoningEfforts = { ...entry.efforts };
    return model;
}

/**
 * 从已勾选的 id 列表渲染出完整的 provider 定义。
 * @param {string[]} enabledIds
 * @param {string} baseURL
 * @returns {object}
 */
export function buildProviderConfig(enabledIds, baseURL) {
    const models = enabledIds
        .map(id => CATALOG_BY_ID.get(id))
        .filter(entry => entry !== undefined && entry.conversational)
        .map(toProviderModel);

    return {
        displayName: 'AMD Radeon Cloud',
        apiKeyEnv: 'RADEON_LOCAL_KEY',
        api: 'openai-completions',
        baseURL,
        compat: {
            supportsDeveloperRole: false,
            supportsReasoningEffort: true,
            supportsThinkingTokenBudget: false,
            maxTokensField: 'max_tokens',
            thinkingFormat: 'openai',
        },
        models,
    };
}
