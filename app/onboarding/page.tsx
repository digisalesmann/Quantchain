import { redirect } from 'next/navigation'
import { requireSessionUserId } from '../../lib/session'
import prisma from '../../lib/prisma'
import OnboardingWizard from '../../components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const userId = await requireSessionUserId()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, kyc: true }
  })
  if (!user) redirect('/auth/login')
  if (user.onboardingCompletedAt) redirect('/')

  return (
    <div className="min-h-screen px-6">
      <OnboardingWizard
        userId={user.id}
        email={user.email}
        initialFullName={user.profile?.fullName ?? ''}
        initialCountry={user.profile?.country ?? ''}
        initialPhone={user.profile?.phone ?? ''}
        initialKycStatus={user.kyc?.status ?? null}
        initialTotpEnabled={user.totpEnabled}
      />
    </div>
  )
}
