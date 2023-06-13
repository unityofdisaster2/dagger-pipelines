import { connect } from "@dagger.io/dagger";

connect(
  async (client) => {
    // get reference to the local project
    const source = client.host().directory(".", { exclude: ["node_modules/"] });

    const nodeCache = client.cacheVolume("node");

    // get Node image
    const node = client.container().from("node:16")
      .withMountedCache("./node_modules", nodeCache);

    const runner = node
      .withDirectory(".", source)
      .withWorkdir(".")
      .withExec(["npm", "install","-g","newman"]);

    // run application tests
    const test = runner
        .withExec(["newman", "run", "test_collection.postman_collection.json", "--suppress-exit-code", "--reporters","cli,junit", "--reporter-junit-export","results/junitReport.xml"])
        .directory("./results");

    await test.export('results/');

  },
  { LogOutput: process.stdout }
);

// newman run test_collection.postman_collection.json --reporters cli,junit --reporter-junit-export results/junitReport.xml