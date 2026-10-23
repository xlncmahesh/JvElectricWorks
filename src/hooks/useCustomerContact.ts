import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchSavedContact } from '@/lib/api';
import { readSavedContact, type SavedContact } from '@/lib/contact';

export function useCustomerContact() {
  const { user } = useAuth();
  const [contact, setContact] = useState<SavedContact>(() => ({
    email: user?.email ?? readSavedContact().email,
    phone: readSavedContact().phone,
  }));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const local = readSavedContact();
      if (mounted) setContact({ email: user?.email ?? local.email, phone: local.phone });
      if (!user) return;
      try {
        const saved = await fetchSavedContact();
        if (mounted) {
          setContact({
            email: user.email ?? saved.email ?? local.email,
            phone: saved.phone ?? local.phone,
          });
        }
      } catch {
        // Local values and the signed-in email remain available.
      }
    };
    void load();
    return () => { mounted = false; };
  }, [user]);

  return contact;
}
