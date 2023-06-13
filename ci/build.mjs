import { connect } from "@dagger.io/dagger"


connect(async (client) => {

  // use a node:16-slim container
  // mount the source code directory on the host
  // at /src in the container
  const source = client.container()
    .from("node:16-slim")
    .withDirectory('/src', client.host().directory('.'),
    { exclude: ["node_modules/", "ci/"] })

    /**
     * 
     * Como se puede ver se van encadenando cada uno de los pasos en una asignacion de variables
     * se ejecuta un step del pipeline y al finalizarlo si se va a ejecutar una nuevo se
     * asigna a una variable
     * 
     */

  // set the working directory in the container
  // install application dependencies
  const runner = source
    .withWorkdir("/src")
    .withExec(["npm", "install"])

  // run application tests
  const test = runner
    .withExec(["npm", "test", "--", "--watchAll=false"])

  // build application
  // write the build output to the host
  const buildDir = test
    .withExec(["npm", "run", "build"])
    // obtiene la referencia del directorio ./build dentro del contenedor
    .directory("./build")

    // escribe el directorio build desde el contenedor hacia el host
  await buildDir.export("./build")

  // lista de archivos y directorios en el path.
  const e = await buildDir.entries()

  console.log("build dir contents:\n", e)

}, { LogOutput: process.stdout })