"""Initial Supabase PostgreSQL schema for Nucleus Context Compression Engine

Revision ID: 001_initial_supabase_schema
Revises: 
Create Date: 2026-08-01 14:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_supabase_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create compression_jobs table
    op.create_table(
        'compression_jobs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('dataset_name', sa.String(length=100), nullable=True),
        sa.Column('original_text', sa.Text(), nullable=False),
        sa.Column('compressed_text', sa.Text(), nullable=False),
        sa.Column('original_tokens', sa.Integer(), nullable=False),
        sa.Column('compressed_tokens', sa.Integer(), nullable=False),
        sa.Column('compression_ratio', sa.Float(), nullable=False),
        sa.Column('cost_saved_usd', sa.Float(), nullable=True),
        sa.Column('latency_ms', sa.Float(), nullable=True),
        sa.Column('latency_speedup', sa.Float(), nullable=True),
        sa.Column('semantic_accuracy', sa.Float(), nullable=True),
        sa.Column('provider_used', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('warning', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_compression_jobs_created_at', 'compression_jobs', ['created_at'], unique=False)
    op.create_index('ix_compression_jobs_compression_ratio', 'compression_jobs', ['compression_ratio'], unique=False)
    op.create_index('ix_compression_jobs_provider_used', 'compression_jobs', ['provider_used'], unique=False)

    # Create evaluation_results table
    op.create_table(
        'evaluation_results',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('compression_job_id', sa.String(length=36), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('original_answer', sa.Text(), nullable=True),
        sa.Column('compressed_answer', sa.Text(), nullable=True),
        sa.Column('similarity_score', sa.Float(), nullable=True),
        sa.Column('passed', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['compression_job_id'], ['compression_jobs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_evaluation_results_job_id', 'evaluation_results', ['compression_job_id'], unique=False)

    # Create history_records table
    op.create_table(
        'history_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('compression_job_id', sa.String(length=36), nullable=False),
        sa.Column('run_time', sa.Float(), nullable=True),
        sa.Column('notes', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['compression_job_id'], ['compression_jobs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_history_records_job_id', 'history_records', ['compression_job_id'], unique=False)

def downgrade() -> None:
    op.drop_table('history_records')
    op.drop_table('evaluation_results')
    op.drop_table('compression_jobs')
