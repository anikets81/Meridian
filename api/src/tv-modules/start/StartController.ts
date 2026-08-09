import type { Request, Response } from 'express';
import { normalizeTimezone } from '../../helpers/timezone';

export class StartController {
    fetchAllLists = async (req: Request, res: Response) => {
        const organizationId = req.query.organizationId ? Number(req.query.organizationId) : undefined;
        return res.tvJson(await req.appUser.startManager.fetchAllLists(organizationId));
    };

    fetchAllState = async (req: Request, res: Response) => {
        if (!req?.query?.tz) {
            return res.status(400).send('tz is required');
        }
        const organizationId = req.query.organizationId ? Number(req.query.organizationId) : undefined;
        const tz = normalizeTimezone(req.query.tz as string);
        return res.tvJson(await req.appUser.startManager.fetchAllState(tz, organizationId));
    };

    searchTaskInAllProjects = async (req: Request, res: Response) => {
        const organizationId = req.query.organizationId ? Number(req.query.organizationId) : undefined;
        return res.tvJson(await req.appUser.startManager.searchTaskInAllProjects(req?.query?.description as string, organizationId));
    };
}
