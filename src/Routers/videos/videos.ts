import { Request, Response, Router } from "express"
import { VideoType } from "../../Types/videoType";
import { Resolutions } from "../../Types/Resolutions";
import { ErrorMessages } from "../../Types/ErrorMessages";
import { RequestWithBody, RequestWithParams, RequestWithParamsAndBody } from "../../Types/Requests";
import { StringIsEmptyOrTooLong } from "../../DataValidation/StringFieldValidation";
import { type } from "os";


export const videosRouter = Router();

export const NODE_VIDEO_PATH = "/hometask_01/api/videos"

type PostBodyData = {
    title: string,
    author: string,
    availableResolutions: Resolutions[]
}

type PutBodyData = PostBodyData & {
    canBeDownloaded: boolean,
    minAgeRestriction: number,
    publicationDate: string
}

let Repo: VideoType[] = [
    {
        id: 0,
        title: "Batman",
        author: "Nolan",
        canBeDownloaded: true,
        minAgeRestriction: 14,
        createdAt: "2005-06-15T15:52:59.025Z",
        publicationDate: "2005-06-16T15:52:59.025Z",
        availableResolutions: [Resolutions.P720, Resolutions.P1080]

    }
]


//GET
videosRouter.get(NODE_VIDEO_PATH, (requst: Request, response: Response) => {
    response.send(Repo);
})
videosRouter.get(NODE_VIDEO_PATH + '/:id', (request: RequestWithParams<{ id: number }>, response: Response) => {
    let requestedId: number = +request.params.id;

    //если подается странный id
    if (isNaN(requestedId)) {
        response.send(400);
        return;
    }

    let foundVideo = Repo.find(video => video.id === requestedId);
    if (!foundVideo) {
        response.send(404);
        return;
    }
    else {
        response.status(200).send(foundVideo);
    }
})

//POST
videosRouter.post(NODE_VIDEO_PATH, (request: RequestWithBody<PostBodyData>, response: Response) => {
    let requestData = request.body;
    let requestError: ErrorMessages;

    //Проверка запроса на ошибку
    requestError = FindErrors(requestData);

    if (requestError.errorsMessages.length > 0) {
        response.status(400).send(requestError);
        return;
    }

    //Запрос содержит валидные данные
    //Собираем поля нового объекта
    const createdAt: Date = new Date();
    const publicationDate: Date = new Date;
    publicationDate.setDate(createdAt.getDate() + 1);

    const newVideoObject: VideoType = {
        ...requestData,
        id: +(new Date()),
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate: publicationDate.toISOString()
    }

    //Добавляем новый объект в хранилище
    Repo.push(newVideoObject);

    response.status(201).send(newVideoObject);
})

//PUT
videosRouter.put(NODE_VIDEO_PATH + '/:id',
    (request: RequestWithParamsAndBody<{ id: number }, PutBodyData>, response: Response) => {
        let requestedId: number = +request.params.id;

        //Провера по ID
        //если подается странный id
        if (isNaN(requestedId)) {
            response.send(400);
            return;
        }

        let foundVideo = Repo.find(video => video.id === requestedId);
        if (!foundVideo) {
            response.send(404);
            return;
        }

        //Проверка Body
        let requestData = request.body;
        let requestError: ErrorMessages;
        //Проверка запроса на ошибку
        requestError = FindErrors(requestData);

        if (requestError.errorsMessages.length > 0) {
            response.status(400).send(requestError);
            return;
        }

        //Запрос содержит валидный id и body
        //Заменяем текущие поля на новые
        //TODO спросить про более удачную практику, через indexOf?
        Repo = Repo.map(videoData => videoData.id === requestedId ?
            {
                ...videoData,
                author: requestData.author,
                title: requestData.title,
                availableResolutions: requestData.availableResolutions,
                canBeDownloaded: requestData.canBeDownloaded,
                minAgeRestriction: requestData.minAgeRestriction,
                publicationDate: requestData.publicationDate
            }
            : videoData)

        response.send(204);
    })

//DELETE
videosRouter.delete(NODE_VIDEO_PATH + '/:id', (request: RequestWithParams<{ id: number }>, response: Response) => {
    let requestedId: number = +request.params.id;
    let initialLength = Repo.length;

    //если подается странный id
    if (isNaN(requestedId)) {
        response.send(400);
        return;
    }

    Repo = Repo.filter(videoData => videoData.id !== requestedId);
    if (Repo.length === initialLength) {
        response.send(404);
        return;
    }
    response.send(204);
})


videosRouter.delete("/ht_01/api/testing/all-data", (request: Request, response: Response) => {
    Repo.length = 0;
    response.send(204);
})




const FindErrors = (data: PostBodyData | PutBodyData): ErrorMessages => {
    let foundErrorMessages: ErrorMessages = {
        errorsMessages: []
    };
    let typeResult: string;

    //Проверяем общие поля для двух типов
    //Author
    if (StringIsEmptyOrTooLong(data.author, 20)) {
        foundErrorMessages.errorsMessages.push({ message: "Invalid author", field: "author" })
    }
    //Title
    if (StringIsEmptyOrTooLong(data.title, 40)) {
        foundErrorMessages.errorsMessages.push({ message: "Invalid title", field: "title" })
    }
    //Resolutions
    if (!Array.isArray(data.availableResolutions) || data.availableResolutions.length === 0) {
        foundErrorMessages.errorsMessages.push({ message: "Invalid resolution value", field: "availableResolution" })
    }
    else {
        data.availableResolutions.forEach(resolution => {
            if (!Object.values(Resolutions).includes(resolution)) {
                foundErrorMessages.errorsMessages.push({ message: "Wrong resolution value", field: "availableResolution" })
            }
        })
    }


    //Проверка дополнительных параметров
    //TODO найти способ проверки типа(более удачный)
    if ('canBeDownloaded' in data) {

        //canBeDownloaded - проверка что boolean
        if (!((typeResult = typeof data.canBeDownloaded) === 'boolean')) {
            foundErrorMessages.errorsMessages.push({ message: 'Invalid type of field: ${typeResult}. Expect: boolean', field: 'canBeDownloaded' });
        }

        //minAgeRestriction - проверка что number/проверка валидности значения
        if (!((typeResult = typeof data.minAgeRestriction) === 'number')) {
            foundErrorMessages.errorsMessages.push({ message: 'Invalid type of field: ${typeResult}. Expect: number', field: "minAgeRestriction" })
        }
        else {
            //Это число - проверка на валидность значения
            //TODO либо проверка через массив/enum либо через границы - определить
            if (data.minAgeRestriction > 18 || data.minAgeRestriction < 0) {
                foundErrorMessages.errorsMessages.push({ message: 'Invalid value', field: "minAgeRestriction" })
            }
        }

        //publicationDate - проверка что string
        if (!((typeResult = typeof data.publicationDate) === 'string')) {
            foundErrorMessages.errorsMessages.push({ message: 'Invalid type of field: ${typeResult}. Expect: string', field: "minAgeRestriction" })
        }
        else {
            //publicationDate - проверка валидный формат
            let dateValue: number = Date.parse(data.publicationDate);
            if (isNaN(dateValue))
                foundErrorMessages.errorsMessages.push({ message: 'Invalid value of field. Parse error', field: "publicationDate" })

        }
    }

    return foundErrorMessages;
}