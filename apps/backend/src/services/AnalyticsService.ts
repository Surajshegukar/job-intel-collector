import { Job } from '../models/Job';
import { Company } from '../models/Company';
import { Skill } from '../models/Skill';
import { Application } from '../models/Application';

export class AnalyticsService {
  /**
   * Get overall overview stats.
   */
  static async getOverviewStats(): Promise<{
    totalJobs: number;
    totalCompanies: number;
    totalSkills: number;
    totalApplications: number;
    statusDistribution: { status: string; count: number }[];
  }> {
    const totalJobs = await Job.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalApplications = await Application.countDocuments();

    const statusAggregation = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusDistribution = statusAggregation.map(item => ({
      status: item._id,
      count: item.count
    }));

    return {
      totalJobs,
      totalCompanies,
      totalSkills,
      totalApplications,
      statusDistribution
    };
  }

  /**
   * Get top requested skills.
   */
  static async getTopSkills(limit = 10): Promise<any[]> {
    return Skill.find()
      .sort({ frequency: -1 })
      .limit(limit)
      .select('name category frequency');
  }

  /**
   * Get companies with the most job posts.
   */
  static async getTopCompanies(limit = 10): Promise<any[]> {
    const aggregation = await Job.aggregate([
      {
        $group: {
          _id: '$companyId',
          jobCount: { $sum: 1 }
        }
      },
      {
        $sort: { jobCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: '$company'
      },
      {
        $project: {
          _id: 1,
          name: '$company.name',
          website: '$company.website',
          industry: '$company.industry',
          jobCount: 1
        }
      }
    ]);

    return aggregation;
  }

  /**
   * Get job location distribution.
   */
  static async getLocationStats(limit = 10): Promise<any[]> {
    const aggregation = await Job.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $or: [{ $eq: ['$location', ''] }, { $not: ['$location'] }] },
              then: 'Remote / Not Specified',
              else: '$location'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          location: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return aggregation;
  }

  /**
   * Get salary ranges.
   * Categorizes salary strings into basic salary bands.
   */
  static async getSalaryRangeStats(): Promise<any[]> {
    const jobs = await Job.find({}, 'salary');
    
    const bands = {
      'Not Specified': 0,
      '< $50,000': 0,
      '$50,000 - $100,000': 0,
      '$100,000 - $150,000': 0,
      '$150,000 - $200,000': 0,
      '$200,000+': 0
    };

    for (const job of jobs) {
      const salaryStr = job.salary;
      if (!salaryStr || salaryStr.trim() === '') {
        bands['Not Specified']++;
        continue;
      }

      // Try to parse numbers from string (e.g. $120,000, 100k, $120k - $150k)
      const matches = salaryStr.replace(/,/g, '').match(/\d+/g);
      if (!matches || matches.length === 0) {
        bands['Not Specified']++;
        continue;
      }

      // If we find numbers, let's look at the first or average number
      let val = parseInt(matches[0]);
      
      // If the number is small (e.g., 80, 150), it's probably in thousands (k)
      if (val < 1000) {
        val = val * 1000;
      }

      if (val < 50000) {
        bands['< $50,000']++;
      } else if (val >= 50000 && val < 100000) {
        bands['$50,000 - $100,000']++;
      } else if (val >= 100000 && val < 150000) {
        bands['$100,000 - $150,000']++;
      } else if (val >= 150000 && val < 200000) {
        bands['$150,000 - $200,000']++;
      } else {
        bands['$200,000+']++;
      }
    }

    return Object.keys(bands).map(key => ({
      range: key,
      count: bands[key as keyof typeof bands]
    }));
  }
}
