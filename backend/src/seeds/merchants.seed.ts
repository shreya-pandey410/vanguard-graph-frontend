import { prismaClient } from '../services/db/prisma'
import { logger } from '../config/logger'

const merchantsData = [
  // Fraud ring 1: Shared device fingerprint "D-773"
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '9876543210', deviceFingerprint: 'D-773', ipAddress: '192.168.1.10', bankAccountNumber: '123456789012', bankAccountIfsc: 'HDFC0001234' },
  { name: 'Suresh Patel', email: 'suresh.patel@example.com', phone: '9876543211', deviceFingerprint: 'D-773', ipAddress: '192.168.1.11', bankAccountNumber: '123456789013', bankAccountIfsc: 'HDFC0001234' },
  { name: 'Amit Singh', email: 'amit.singh@example.com', phone: '9876543212', deviceFingerprint: 'D-773', ipAddress: '192.168.1.12', bankAccountNumber: '123456789014', bankAccountIfsc: 'ICIC0005678' },
  { name: 'Vikram Joshi', email: 'vikram.joshi@example.com', phone: '9876543213', deviceFingerprint: 'D-773', ipAddress: '192.168.1.13', bankAccountNumber: '123456789015', bankAccountIfsc: 'ICIC0005678' },
  { name: 'Deepak Verma', email: 'deepak.verma@example.com', phone: '9876543214', deviceFingerprint: 'D-773', ipAddress: '10.0.0.5', bankAccountNumber: '123456789016', bankAccountIfsc: 'AXIS0009101' },
  // Fraud ring 2: Shared bank account ending in "4421"
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '9876543215', deviceFingerprint: 'D-884', ipAddress: '192.168.1.20', bankAccountNumber: '442144214421', bankAccountIfsc: 'SBIN0001234' },
  { name: 'Ananya Gupta', email: 'ananya.gupta@example.com', phone: '9876543216', deviceFingerprint: 'D-885', ipAddress: '192.168.1.21', bankAccountNumber: '442144214421', bankAccountIfsc: 'SBIN0001234' },
  { name: 'Neha Reddy', email: 'neha.reddy@example.com', phone: '9876543217', deviceFingerprint: 'D-886', ipAddress: '192.168.1.22', bankAccountNumber: '442144214421', bankAccountIfsc: 'SBIN0001234' },
  // Fraud ring 3: Same IP range "192.168.1.x"
  { name: 'Rahul Mehta', email: 'rahul.mehta@example.com', phone: '9876543218', deviceFingerprint: 'D-991', ipAddress: '192.168.1.30', bankAccountNumber: '998877665544', bankAccountIfsc: 'HDFC0004321' },
  { name: 'Sanjay Agarwal', email: 'sanjay.agarwal@example.com', phone: '9876543219', deviceFingerprint: 'D-992', ipAddress: '192.168.1.31', bankAccountNumber: '998877665545', bankAccountIfsc: 'HDFC0004321' },
  { name: 'Arun Nair', email: 'arun.nair@example.com', phone: '9876543220', deviceFingerprint: 'D-993', ipAddress: '192.168.1.32', bankAccountNumber: '998877665546', bankAccountIfsc: 'ICIC0001111' },
  { name: 'Mohan Das', email: 'mohan.das@example.com', phone: '9876543221', deviceFingerprint: 'D-994', ipAddress: '192.168.1.33', bankAccountNumber: '998877665547', bankAccountIfsc: 'ICIC0001111' },
  // Clean merchants
  { name: 'Anita Desai', email: 'anita.desai@example.com', phone: '9876543222', deviceFingerprint: 'D-101', ipAddress: '172.16.0.1', bankAccountNumber: '111122223333', bankAccountIfsc: 'YESB0001234' },
  { name: 'Vijay Khanna', email: 'vijay.khanna@example.com', phone: '9876543223', deviceFingerprint: 'D-102', ipAddress: '172.16.0.2', bankAccountNumber: '222233334444', bankAccountIfsc: 'YESB0001234' },
  { name: 'Kavita Iyer', email: 'kavita.iyer@example.com', phone: '9876543224', deviceFingerprint: 'D-103', ipAddress: '172.16.0.3', bankAccountNumber: '333344445555', bankAccountIfsc: 'HDFC0005678' },
  { name: 'Rohit Saxena', email: 'rohit.saxena@example.com', phone: '9876543225', deviceFingerprint: 'D-104', ipAddress: '172.16.0.4', bankAccountNumber: '444455556666', bankAccountIfsc: 'HDFC0005678' },
  { name: 'Pooja Mishra', email: 'pooja.mishra@example.com', phone: '9876543226', deviceFingerprint: 'D-105', ipAddress: '172.16.0.5', bankAccountNumber: '555566667777', bankAccountIfsc: 'AXIS0009101' },
  { name: 'Manish Tiwari', email: 'manish.tiwari@example.com', phone: '9876543227', deviceFingerprint: 'D-106', ipAddress: '172.16.0.6', bankAccountNumber: '666677778888', bankAccountIfsc: 'SBIN0005678' },
  { name: 'Sneha Kapoor', email: 'sneha.kapoor@example.com', phone: '9876543228', deviceFingerprint: 'D-107', ipAddress: '172.16.0.7', bankAccountNumber: '777788889999', bankAccountIfsc: 'ICIC0002222' },
  { name: 'Gaurav Bansal', email: 'gaurav.bansal@example.com', phone: '9876543229', deviceFingerprint: 'D-108', ipAddress: '172.16.0.8', bankAccountNumber: '888899990000', bankAccountIfsc: 'KOTK0001234' },
]

export async function seedMerchants(): Promise<void> {
  logger.info('Seeding merchants...')
  for (const m of merchantsData) {
    await prismaClient.merchant.upsert({
      where: { email: m.email },
      update: {},
      create: m,
    })
  }
  logger.info(`Seeded ${merchantsData.length} merchants`)
}
