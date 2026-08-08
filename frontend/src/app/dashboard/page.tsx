'use client';
import EscrowDashboard from '../../components/EscrowDashboard';

export default function DashboardHome() {
  return (
    <>
      <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Welcome back.</h1>
        <p className="text-gray-500 font-medium tracking-tight">
          Here is an overview of your active escrows and network activity.
        </p>
      </div>
      
      <EscrowDashboard />
      
      {/* Feed Placeholder */}
      <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Recent Network Activity</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F7] flex items-center justify-center font-semibold text-gray-700">0x8B</div>
            <div>
              <p className="font-semibold text-gray-900 tracking-tight">0x8B2...4D1A <span className="text-gray-500 font-normal">completed a milestone</span></p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Smart Contract Audit - $5,000</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
