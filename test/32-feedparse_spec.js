const should = require("should");
const helper = require("node-red-node-test-helper");

const node = require("../32-feedparse");

describe("FeedParse Node", () => {
    before((done) => {
        helper.startServer(done);
    });

    after((done) => {
        helper.stopServer(done);
    });

    afterEach(() => {
        helper.unload();
    });

    it("should be loaded", (done) => {
        let flow = [{id:"n1", type:"feedparse", interval: 15, url: "test", name: "test" }];
        helper.load(node, flow, () => {
            const n1 = helper.getNode("n1");
            n1.should.have.property("name", "test");
            done();
        });
    });

    it("get feed　(encode is utf-8)", (done) => {
        let flow = [
            {id:"n1", type:"feedparse", interval: 15, url: "https://discourse.nodered.org/posts.rss", encode: "utf-8", name: "test" , wires:[["n2"]] },
            { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            let count = 0;
            n2.on("input", (msg) => {
                msg.topic.should.startWith("https://discourse.nodered.org/");
                if(count === 0){
                    done();
                    count++;
                }
            });
        });
    });

    it("get feed　(encode is empty)", (done) => {
        let flow = [
            {id:"n1", type:"feedparse", interval: 15, url: "https://discourse.nodered.org/posts.rss", encode: "", name: "test" , wires:[["n2"]] },
            { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            let count = 0;
            n2.on("input", (msg) => {
                msg.topic.should.startWith("https://discourse.nodered.org/");
                if(count === 0){
                    done();
                    count++;
                }
            });
        });
    });

    it("invalid interval", (done) => {
        let flow = [
            {id:"n1", type:"feedparse", interval: 99999, url: "https://discourse.nodered.org/posts.rss", encode: "", name: "test" , wires:[["n2"]] },
            { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            let count = 0;
            n1.on('call:warn', call => {
                call.should.have.property("lastArg", "feedparse.errors.invalidinterval");
                done();
            });
        });
    });

    it("bad host", (done) => {
        let flow = [
            {id:"n1", type:"feedparse", interval: 15, url: "https://discourse.nodered.org/dummy.rss", encode: "", name: "test" , wires:[["n2"]] },
            { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            let count = 0;
            n1.on('call:warn', call => {
                call.lastArg.should.have.startWith("feedparse.errors.badstatuscode");
                done();
            });
        });
    });

});
