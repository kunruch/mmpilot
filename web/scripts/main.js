console.log("Hello World! How are you? I am fine. Ok");

if (process.env.NODE_ENV === "development") {
  console.log('development only')
}

if (process.env.OTHER_ENV === "other env") {
  console.log('other env only')
}
