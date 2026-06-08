import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import { requireAuth, requireModulePermission } from "../lib/auth";
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
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requireAuth);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(requireModulePermission("sales"), customersRouter);
router.use(requireModulePermission("inventory"), productsRouter);
router.use(requireModulePermission("inventory"), warehousesRouter);
router.use(requireModulePermission("purchases"), suppliersRouter);
router.use(salesRouter);
router.use(purchasesRouter);
router.use(usersRouter);
router.use(requireModulePermission("reports"), reportsRouter);
router.use(requireModulePermission("planning"), planningRouter);

export default router;
