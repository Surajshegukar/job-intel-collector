import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { Job } from '../models/Job';
import { CompanyService } from '../services/CompanyService';
import { AuthenticatedRequest } from '../middleware/auth';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Find all distinct companyIds of the user's jobs
    const userCompanyIds = await Job.find({ userId }).distinct('companyId');

    const search = req.query.search as string;
    const query: any = { _id: { $in: userCompanyIds } };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const companies = await Company.find(query).sort({ name: 1 });
    return res.json(companies);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Fetch jobs associated with this company that belong to this user
    const jobs = await Job.find({ companyId: company._id, userId }).sort({ createdAt: -1 });

    return res.json({
      company,
      jobs
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, website, linkedinUrl, industry, companySize, locations, notes, hiringStatus } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await CompanyService.findOrCreateCompany(name, {
      website,
      linkedinUrl,
      industry,
      companySize,
      location: locations?.[0]
    });

    let updated = false;

    if (locations && locations.length > 1) {
      for (const loc of locations) {
        if (!company.locations.includes(loc)) {
          company.locations.push(loc);
          updated = true;
        }
      }
    }

    if (notes && company.notes !== notes) {
      company.notes = notes;
      updated = true;
    }

    if (hiringStatus && company.hiringStatus !== hiringStatus) {
      company.hiringStatus = hiringStatus;
      updated = true;
    }

    if (updated) {
      await company.save();
    }

    return res.status(201).json(company);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

