//1) Импортируем необходимые объекты express
import express from "express"
import { videosRouter } from "./Routers/videos/videos";

//2) объявляем объект приложения из метода
export const app = express();
//Определяем порт
const PORT: number = 5000;
//Задаем возможность юзать body
app.use(express.json());


//3) Определяем набор конечных точек нашего приложения
app.use(videosRouter);

app.listen(PORT, () => {
    console.log("App running");
})