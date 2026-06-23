import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { Job } from '../models/Job';
import { CompanyService } from '../services/CompanyService';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const query: any = {};

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
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Fetch jobs associated with this company
    const jobs = await Job.find({ companyId: company._id }).sort({ createdAt: -1 });

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

