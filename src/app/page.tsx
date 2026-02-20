'use client';

import React, { useEffect, useState } from 'react';
import { Search, Scale, TrendingUp, FileText, Clock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import MatterCard from '@/components/MatterCard';
import { mattersService } from '@/services/matters.service';
import { Matter } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatters() {
      try {
        const data = await mattersService.list();
        setMatters(data);
      } catch (error) {
        console.error('Failed to fetch matters:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMatters();
  }, []);

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      background: 'var(--color-bg-base)',
    }}>
      {/* Slim Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: 56,
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-deep)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }} className="text-gradient">
            Certis
          </span>
          <span style={{
            fontSize: 10, fontWeight: 500, color: 'var(--color-text-muted)',
            padding: '2px 8px',
            background: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-full)',
          }}>
            DRAFT INTELLIGENCE
          </span>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 14px',
          background: 'var(--color-bg-raised)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          width: 280,
        }}>
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            placeholder="Search matters..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--color-text-primary)', fontSize: 13,
              fontFamily: 'var(--font-sans)', width: '100%',
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 36,
        }}>
          {[
            { label: 'Active Matters', value: '4', icon: <Scale size={18} />, color: 'var(--color-accent-400)' },
            { label: 'Claims Drafted', value: '47', icon: <FileText size={18} />, color: 'var(--color-success)' },
            { label: 'Avg. Score', value: '79', icon: <TrendingUp size={18} />, color: 'var(--color-warning)' },
            { label: 'Hours Saved', value: '~68', icon: <Clock size={18} />, color: 'var(--color-info)' },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stat.label}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 'var(--radius-lg)',
                  background: `${stat.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              Matters
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
              {matters.length} active matters across your portfolio
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'In Progress', 'Complete'].map((filter, i) => (
              <button key={filter} style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.12s ease',
                background: i === 0 ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: i === 0 ? 'var(--color-accent-300)' : 'var(--color-text-tertiary)',
              }}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Matter List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {matters.map((matter, i) => (
            <div key={matter.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s`, animationFillMode: 'both' }}>
              <MatterCard matter={matter} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
