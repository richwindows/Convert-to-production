import { createClient } from '@supabase/supabase-js'

// Supabase配置
// 注意：在生产环境中，这些值应该从环境变量中获取
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL 
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY 

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey)

// 导出配置常量
export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  key: supabaseKey
}