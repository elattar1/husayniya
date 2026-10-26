import { useRouter, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
export function CustomerError() { const router = useRouter(); return <div role="alert" className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center"><h1 className="text-xl">تعذر تحميل الصفحة</h1><Button onClick={() => router.invalidate()}>إعادة المحاولة</Button></div>; }
export function CustomerNotFound() { return <div className="space-y-4 p-10 text-center"><h1 className="text-xl">الخدمة غير متاحة</h1><Button asChild><Link to="/">تصفح المتاجر</Link></Button></div>; }
