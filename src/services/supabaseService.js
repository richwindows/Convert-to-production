import { supabase } from '../config/supabase'
import { convertToDecimal } from '../utils/numberUtils'

/**
 * 从Supabase数据库获取指定batch number的数据
 * @param {string} batchNumber - Batch Number
 * @returns {Promise<Object>} - 包含数据和错误信息的对象
 */
export const fetchInvoiceData = async (batchNumber) => {
  try {
    if (!batchNumber || batchNumber.trim() === '') {
      throw new Error('Batch Number不能为空')
    }

    console.log(`正在从Supabase获取Batch Number: ${batchNumber} 的数据...`)

    // 从order_items表查询batch_assigned字段，同时关联查询invoices表获取customer_name
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        invoices!invoice_id (
          customer_name
        )
      `)
      .eq('batch_assigned', batchNumber)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase查询错误:', error)
      throw new Error(`数据库查询失败: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`未找到Batch Number为 ${batchNumber} 的数据`)
    }

    console.log(`成功获取Batch数据: ${data.length}条记录`)
    return { success: true, data, error: null }

  } catch (error) {
    console.error('获取Batch数据失败:', error)
    return { success: false, data: null, error: error.message }
  }
}

/**
 * 将Supabase返回的batch数据转换为应用程序所需的格式
 * @param {Array} batchData - 从Supabase获取的order_items数据数组
 * @returns {Array} - 转换后的窗户数据数组
 */
export const transformInvoiceDataToWindowData = (batchData) => {
  try {
    // batchData应该是一个数组，包含order_items记录
    if (!Array.isArray(batchData)) {
      throw new Error('Batch数据格式不正确，应该是数组')
    }

    // 转换数据格式以匹配应用程序的allExcelData结构
    const transformedData = batchData.map((item, index) => {
      return {
        Customer: item.invoices?.customer_name || item.customer_name || item.Customer || '',
        ID: item.id || (index + 1).toString(),
        Style: item.item_name || item.style || item.Style || '',
        W: convertToDecimal(item.width || item.W || ''),
        H: convertToDecimal(item.height || item.H || ''),
        FH: convertToDecimal(item.fh || item.FH || ''),
        Frame: item.frame || item.Frame || '',
        Glass: item.glass_option || item.Glass || '',
        Argon: item.argon || item.Argon || '',
        Grid: item.grid_style || item.Grid || '',
        Color: item.color || item.Color || '',
        Note: item.note || item.Note || '',
        'Batch NO.': item.batch_assigned || item['Batch NO.'] || '',
        Quantity: item.quantity || item.Quantity || 1,
        bottomtempered: item.bottomtempered || 0
      }
    })

    console.log(`成功转换${transformedData.length}条窗户数据`)
    return transformedData

  } catch (error) {
    console.error('转换Batch数据失败:', error)
    throw new Error(`数据转换失败: ${error.message}`)
  }
}