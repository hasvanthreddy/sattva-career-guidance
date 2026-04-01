import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import careerRouter from "./career";
import roadmapRouter from "./roadmap";
import resumeRouter from "./resume";
import coursesRouter from "./courses";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiRouter);
router.use("/career", careerRouter);
router.use("/roadmap", roadmapRouter);
router.use("/resume", resumeRouter);
router.use("/courses", coursesRouter);

export default router;
