import { connect } from "@dagger.io/dagger"


connect(async (client) => {

  // use a node:16-slim container
  // mount the source code directory on the host
  // at /src in the container
  const source = client.container()
    .from("node:16-slim")
    .withDirectory('/src', client.host().directory('.'),
    { exclude: ["node_modules/", "ci/"] })

  // set the working directory in the container
  // install application dependencies
  const runner = source
    .withWorkdir("/src")
    .withExec(["npm", "install"])

  // run application tests
  const test = runner
    .withExec(["npm", "test", "--", "--watchAll=false"])

  // first stage
  // build application
  const buildDir = test
    .withExec(["npm", "run", "build"])
    .directory("./build")

  // second stage
  // use an nginx:alpine container
  // copy the build/ directory from the first stage
  // publish the resulting container to a registry

  // en el archivo publish todo se hace con la referencia del mismo contenedor
  // es decir, en un solo stage. Para habilitar un stage nuevo se debe ejecutar todo en un nuevo
  // contenedor. Evidentemente este nuevo entorno no va a tener nada de informacion del anterior,
  // asi que si se quiere compartir un estado en particular, se puede simplemente usar la variable
  // del ultimo step. en este caso se agrega el resultado final del pipeline anterior al siguiente
  // para determinar cual es el directorio de build
  const imageRef = await client.container()
    .from("nginx:1.23-alpine")
    .withDirectory('/usr/share/nginx/html', buildDir)
    .publish('ttl.sh/hello-dagger-' + Math.floor(Math.random() * 10000000))
  console.log(`Published image to: ${imageRef}`)

}, { LogOutput: process.stdout })