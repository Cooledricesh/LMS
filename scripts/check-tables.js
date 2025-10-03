const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  try {
    // 테이블 존재 확인
    const tables = ['profiles', 'courses', 'enrollments', 'assignments', 'submissions'];

    console.log('=== LMS 테이블 생성 확인 ===\n');

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`❌ ${table}: 테이블이 존재하지 않거나 에러 발생`);
        console.log(`   에러: ${error.message}`);
      } else {
        console.log(`✅ ${table}: 테이블이 정상적으로 생성됨`);
      }
    }

    // profiles 테이블 구조 확인
    console.log('\n=== profiles 테이블 컬럼 확인 ===');
    const { data: columnsData } = await supabase.rpc('get_table_columns', {
      table_name: 'profiles'
    }).single();

    if (columnsData) {
      console.log('profiles 테이블 컬럼:', columnsData);
    }

  } catch (error) {
    console.error('에러 발생:', error);
  }
}

// RPC 함수가 없을 경우를 대비한 대체 확인
async function alternativeCheck() {
  console.log('\n=== 대체 방법으로 테이블 확인 ===\n');

  // 각 테이블에서 select 시도
  const tableChecks = [
    { name: 'profiles', columns: ['id', 'role', 'name'] },
    { name: 'courses', columns: ['id', 'title', 'status'] },
    { name: 'enrollments', columns: ['id', 'course_id', 'learner_id'] },
    { name: 'assignments', columns: ['id', 'title', 'due_date'] },
    { name: 'submissions', columns: ['id', 'content', 'status'] }
  ];

  for (const table of tableChecks) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select(table.columns.join(','))
        .limit(1);

      if (!error) {
        console.log(`✅ ${table.name}: 테이블 접근 성공`);
        console.log(`   컬럼 확인: ${table.columns.join(', ')}`);
      } else {
        console.log(`❌ ${table.name}: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table.name}: ${err.message}`);
    }
  }
}

checkTables().then(() => alternativeCheck());