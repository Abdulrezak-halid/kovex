import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import { requireAuth, requireDataWritePermission } from "../lib/auth";
import dashboardRouter from "./dashboard";
import customersRouter from "./customers";
import suppliersRouter from "./suppliers";
import productsRouter from "./products";
import warehousesRouter from "./warehouses";
import salesRouter from "./sales";
import purchasesRouter from "./purchases";
import usersRouter from "./users";
import reportsRouter from "./reports";
import planningRouter from "./planning";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requireAuth);
router.use(requireDataWritePermission);
router.use(dashboardRouter);
router.use(customersRouter);
router.use(suppliersRouter);
router.use(productsRouter);
router.use(warehousesRouter);
router.use(salesRouter);
router.use(purchasesRouter);
router.use(usersRouter);
router.use(reportsRouter);
router.use(planningRouter);

export default router;
