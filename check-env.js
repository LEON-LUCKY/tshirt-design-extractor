/**
 * 环境变量诊断脚本
 * 用于检查 .env 文件是否被正确加载
 */

console.log('========================================');
console.log('环境变量诊断');
console.log('========================================');
console.log('');

console.log('1. Node 环境:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('');

console.log('2. Remove.bg API 配置:');
console.log('   VUE_APP_REMOVE_BG_API_KEY:', process.env.VUE_APP_REMOVE_BG_API_KEY ? '已设置 (长度: ' + process.env.VUE_APP_REMOVE_BG_API_KEY.length + ')' : '❌ 未设置');
console.log('   VUE_APP_REMOVE_BG_API_ENDPOINT:', process.env.VUE_APP_REMOVE_BG_API_ENDPOINT || '使用默认值');
console.log('');

console.log('3. 其他配置:');
console.log('   VUE_APP_MAX_FILE_SIZE:', process.env.VUE_APP_MAX_FILE_SIZE || '使用默认值');
console.log('   VUE_APP_API_TIMEOUT:', process.env.VUE_APP_API_TIMEOUT || '使用默认值');
console.log('   VUE_APP_DEBUG:', process.env.VUE_APP_DEBUG || 'false');
console.log('');

console.log('4. 所有 VUE_APP_ 开头的环境变量:');
Object.keys(process.env)
  .filter(key => key.startsWith('VUE_APP_'))
  .forEach(key => {
    const value = process.env[key];
    // 隐藏 API 密钥的完整内容
    if (key.includes('KEY') || key.includes('SECRET')) {
      console.log(`   ${key}: ${value ? value.substring(0, 8) + '...' : '未设置'}`);
    } else {
      console.log(`   ${key}: ${value}`);
    }
  });

console.log('');
console.log('========================================');
console.log('诊断完成');
console.log('========================================');
