import { Task, Category } from '@/types/task';
import { generateId } from '@/utils/helpers';

const now = new Date().toISOString();

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Business Setup',
    color: '#4F46E5',
    createdAt: now,
  },
  {
    id: 'cat-2',
    name: 'Compliance',
    color: '#10B981',
    createdAt: now,
  },
  {
    id: 'cat-3',
    name: 'Finance',
    color: '#F59E0B',
    createdAt: now,
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Register Private Limited Company',
    description: 'Complete all steps required to register a new private limited company with the Office of Company Registrar.',
    categoryId: 'cat-1',
    subTasks: [
      {
        id: generateId(),
        description: 'Reserve company name',
        timeline: '1-2 days',
        completed: true,
      },
      {
        id: generateId(),
        description: 'Prepare Memorandum of Association',
        timeline: '3-4 days',
        completed: true,
      },
      {
        id: generateId(),
        description: 'Prepare Articles of Association',
        timeline: '3-4 days',
        completed: false,
      },
      {
        id: generateId(),
        description: 'Submit documents to Company Registrar',
        timeline: '1 day',
        completed: false,
      },
      {
        id: generateId(),
        description: 'Receive Certificate of Incorporation',
        timeline: '7-10 days',
        completed: false,
      },
    ],
    metadata: {
      contact: {
        name: 'Office of Company Registrar',
        email: 'info@ocr.gov.np',
        phone: '+977-1-4215156',
      },
      cost: '50,000 NPR',
      timeline: '3-4 weeks',
      documentsNeeded: [
        'Memorandum of Association',
        'Articles of Association',
        'Director Identification Documents',
        'Proof of Registered Office Address',
      ],
      contingencies: 'If company name is unavailable, have 3 alternative names ready.',
      progressTracker: 'Name reserved, Documents being drafted',
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-2',
    title: 'Obtain Tax Registration Certificate',
    description: 'Register with the tax authorities and obtain Permanent Account Number (PAN) for the company.',
    categoryId: 'cat-2',
    subTasks: [
      {
        id: generateId(),
        description: 'Prepare application for PAN registration',
        timeline: '1 day',
        completed: true,
      },
      {
        id: generateId(),
        description: 'Submit application to Inland Revenue Department',
        timeline: '1 day',
        completed: false,
      },
      {
        id: generateId(),
        description: 'Receive PAN certificate',
        timeline: '3-5 days',
        completed: false,
      },
    ],
    metadata: {
      contact: {
        name: 'Inland Revenue Department',
        email: 'info@ird.gov.np',
        phone: '+977-1-4415802',
      },
      cost: '10,000 NPR',
      timeline: '1-2 weeks',
      documentsNeeded: [
        'Certificate of Incorporation',
        'Company Registration Certificate',
        'Director Identification Documents',
      ],
      contingencies: 'May need to visit office in person if online application has issues.',
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-3',
    title: 'Open Business Bank Account',
    description: 'Open a corporate bank account for the newly registered company.',
    categoryId: 'cat-3',
    subTasks: [
      {
        id: generateId(),
        description: 'Research banks and compare offerings',
        timeline: '2-3 days',
        completed: true,
      },
      {
        id: generateId(),
        description: 'Prepare required documents',
        timeline: '1 day',
        completed: true,
      },
      {
        id: generateId(),
        description: 'Schedule appointment with bank',
        timeline: '1 day',
        completed: true,
      },
      {
        id: generateId(),
        description: 'Meet with bank representative',
        timeline: '1 day',
        completed: false,
      },
      {
        id: generateId(),
        description: 'Receive account details and banking kit',
        timeline: '3-5 days',
        completed: false,
      },
    ],
    metadata: {
      contact: {
        name: 'Nepal Investment Bank',
        email: 'corporate@nib.com.np',
        phone: '+977-1-4228229',
      },
      cost: '5,000 NPR (minimum deposit: 50,000 NPR)',
      timeline: '1-2 weeks',
      documentsNeeded: [
        'Certificate of Incorporation',
        'PAN Certificate',
        'Board Resolution for Bank Account Opening',
        'Director Identification Documents',
        'Company Seal',
      ],
      contingencies: 'Have alternative bank options if first choice has high fees or requirements.',
    },
    createdAt: now,
    updatedAt: now,
  },
];