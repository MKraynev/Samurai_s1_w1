import request from "supertest"
import { app } from "../src"
import { NODE_VIDEO_PATH, NODE_PRE_VIDEO_PATH } from "../src/Routers/videos/videos"
import { Resolutions } from "../src/Types/Resolutions"

describe("/videos", () => {
    it("GET 200", async () => {
        let response = await request(app).get(NODE_VIDEO_PATH).expect(200)
        let responseObject = response.body;

        expect(responseObject).toEqual([])
    })

    it("GET 404 BY ID", async () => {
        let response = await request(app).get(NODE_VIDEO_PATH + "/0").expect(404)

        expect(response.body).toEqual({})
    })

    it("GET 404 WRONG ID", async () => {
        await request(app).get(NODE_VIDEO_PATH + "/100000").expect(404);
    })

    it("POST 201 AND GET 200 CONTAIN POST", async () => {
        let response = await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "Hobbit",
                author: "Tolkien",
                availableResolutions: ["P144"]
            })
            .expect(201);

        let savedValue = response.body;

        let objectAdr: string = NODE_VIDEO_PATH + "/" + String(response.body.id);

        expect(savedValue).toEqual(
            {
                id: expect.any(Number),
                title: "Hobbit",
                author: "Tolkien",
                availableResolutions: ["P144"],
                canBeDownloaded: false,
                minAgeRestriction: null,
                createdAt: expect.any(String),
                publicationDate: expect.any(String)
            })



        response = await request(app)
            .get(objectAdr).expect(200);


        expect(response.body).toEqual(savedValue);



    })

    it("POST 400 EMPTY_AUTHOR", async () => {
        let response = await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "Hobbit",
                author: "",
                availableResolutions: ["P144"]
            })
            .expect(400)

        expect(response.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: expect.any(String)

            }]
        })
    })

    it("POST 400 EMPTY_TITLE", async () => {
        let response = await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "",
                author: "Black",
                availableResolutions: ["P144"]
            })
            .expect(400)

        expect(response.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: expect.any(String)

            }]
        });
    })

    it("POST 400 EMPTY_RESOLUTION", async () => {
        let response = await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "The Picture of Dorian Gray",
                author: "Oscar Wilde",
                availableResolutions: []
            })
            .expect(400)

        expect(response.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: expect.any(String)

            }]
        })
    })
    it("POST 400 WRONG_RESOLUTION", async () => {
        let response = await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "The Picture of Dorian Gray",
                author: "Oscar Wilde",
                availableResolutions: ["P12345"]
            })
            .expect(400)

        expect(response.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: expect.any(String)

            }]
        })
    })

    it("POST 400 EMPTY_BODY", async () => {
        let response = await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "The Picture of Dorian Gray",
                author: "Oscar Wilde",
                availableResolutions: []
            })
            .expect(400);

        expect(response.body).toEqual({
            errorsMessages: [{
                message: expect.any(String),
                field: expect.any(String)

            }]
        })
    })
    let objectId: number;
    let objectAdr: string;

    it("PUT 204_NO_CONTENT AND GET_200 CONTAIN NEW DATA", async () => {
        //Добавляем новый объект
        let response = await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "Hobbit_2",
                author: "Tolkien_2",
                availableResolutions: ["P144"]
            })
            .expect(201);

        let savedValue = response.body;

        objectAdr = NODE_VIDEO_PATH + "/" + String(response.body.id);
        objectId = response.body.id;


        response = await request(app)
            .put(objectAdr)
            .send({
                title: "Batman_2",
                author: "Nolan_2",
                availableResolutions: [Resolutions.P360, Resolutions.P2160],
                canBeDownloaded: false,
                minAgeRestriction: 17,
                publicationDate: "2006-06-16T15:52:59.025Z"
            })
            .expect(204)

        response = await request(app)
            .get(objectAdr)
            .expect(200)

        expect(response.body).toEqual({
            id: objectId,
            title: "Batman_2",
            author: "Nolan_2",
            canBeDownloaded: false,
            minAgeRestriction: 17,
            createdAt: expect.any(String),
            publicationDate: "2006-06-16T15:52:59.025Z",
            availableResolutions: [Resolutions.P360, Resolutions.P2160]
        });

    })

    it("PUT 400 WRONG TITLE", async () => {
        await request(app)
            .put(objectAdr)
            .send({
                title: "",
                author: "Nolan_2",
                availableResolutions: [Resolutions.P360, Resolutions.P2160],
                canBeDownloaded: false,
                minAgeRestriction: 17,
                publicationDate: "2006-06-16T15:52:59.025Z"
            })
            .expect(400)
    })
    it("PUT 400 WRONG AUTHOR", async () => {
        await request(app)
            .put(objectAdr)
            .send({
                title: "Batman",
                author: 5,
                availableResolutions: [Resolutions.P360, Resolutions.P2160],
                canBeDownloaded: false,
                minAgeRestriction: 17,
                publicationDate: "2006-06-16T15:52:59.025Z"
            })
            .expect(400)
    })
    it("PUT 400 WRONG RESOLUTION", async () => {
        await request(app)
            .put(objectAdr)
            .send({
                title: "Batman",
                author: "Nolan",
                availableResolutions: true,
                canBeDownloaded: false,
                minAgeRestriction: 17,
                publicationDate: "2006-06-16T15:52:59.025Z"
            })
            .expect(400)
    })
    it("PUT 400 WRONG CAN_BE_DOWNLOADED", async () => {
        await request(app)
            .put(objectAdr)
            .send({
                title: "Batman",
                author: "Nolan",
                availableResolutions: [Resolutions.P360, Resolutions.P2160],
                canBeDownloaded: "TRUE",
                minAgeRestriction: 17,
                publicationDate: "2006-06-16T15:52:59.025Z"
            })
            .expect(400)
    })
    it("PUT 400 WRONG MIN_AGE", async () => {
        await request(app)
            .put(objectAdr)
            .send({
                title: "Batman",
                author: "Nolan",
                availableResolutions: [Resolutions.P360, Resolutions.P2160],
                canBeDownloaded: true,
                minAgeRestriction: 99,
                publicationDate: "2006-06-16T15:52:59.025Z"
            })
            .expect(400)
    })
    it("PUT 400 WRONG PUBLICATION_DATE", async () => {
        await request(app)
            .put(objectAdr)
            .send({
                title: "Batman",
                author: "Nolan",
                availableResolutions: [Resolutions.P360, Resolutions.P2160],
                canBeDownloaded: true,
                minAgeRestriction: 14,
                publicationDate: "день когда горят костры рябин"
            })
            .expect(400)
    })

    it("DELETE 204 GET_BY_ID_404", async () => {
        await request(app).delete(objectAdr).expect(204);
        await request(app).get(objectAdr).expect(404);
    })

    it("DELETE_ALL 204", async () => {
        await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "Hobbit",
                author: "Tolkien",
                availableResolutions: ["P144"]
            })
            .expect(201);

        await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "Mobbit",
                author: "Molkien",
                availableResolutions: ["P720"]
            })
            .expect(201);

        await request(app)
            .post(NODE_VIDEO_PATH)
            .send({
                title: "Gobbit",
                author: "Golkien",
                availableResolutions: ["P1080"]
            })
            .expect(201);
        let response = await request(app).get(NODE_VIDEO_PATH).expect(200);
        expect(response.body.length >= 3).toBe(true);

        await request(app).delete(NODE_PRE_VIDEO_PATH + "/testing/all-data").expect(204);
        response = await request(app).get(NODE_VIDEO_PATH).expect(200);
        expect(response.body).toEqual([]);
    })
})