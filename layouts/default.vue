<template>
  <div>
    <!-- ヘッダー/ナビゲーションバー -->
    <header>
      <nav>
      </nav>
    </header>

    <!-- メインコンテンツ -->
    <main>
      <Nuxt />
    </main>

    <!-- フッター -->
    <footer>
      <p>&copy; 2024 My Nuxt.js App</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>

<style scoped>
/* シンプルなスタイル */
header {
  background-color: #007bff;
  color: white;
  padding: 1rem;
}

header nav ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

header nav ul li {
  margin-right: 1rem;
}

header nav ul li a {
  color: white;
  text-decoration: none;
}

footer {
  background-color: #f8f9fa;
  text-align: center;
  padding: 1rem;
  border-top: 1px solid #ddd;
}

main {
  padding: 2rem;
}
</style>
