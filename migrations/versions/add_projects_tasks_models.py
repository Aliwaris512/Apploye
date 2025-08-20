"""Add projects and tasks models

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2025-08-16 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create projects table
    op.create_table(
        'project',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False, index=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('client.id'), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('budget', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create tasks table
    op.create_table(
        'task',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('project.id'), nullable=False),
        sa.Column('assigned_to', sa.Integer(), sa.ForeignKey('user.id'), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='todo'),
        sa.Column('priority', sa.String(), nullable=False, server_default='medium'),
        sa.Column('estimated_hours', sa.Float(), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create time_entries table
    op.create_table(
        'timeentry',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), sa.ForeignKey('task.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('billable', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create project_member table
    op.create_table(
        'projectmember',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), sa.ForeignKey('project.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='member'),
        sa.Column('hourly_rate', sa.Float(), nullable=True),
        sa.Column('joined_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'user_id', name='_project_user_uc')
    )

def downgrade():
    op.drop_table('projectmember')
    op.drop_table('timeentry')
    op.drop_table('task')
    op.drop_table('project')
