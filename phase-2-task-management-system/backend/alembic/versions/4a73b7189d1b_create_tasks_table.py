"""Create tasks table

Revision ID: 4a73b7189d1b
Revises: 
Create Date: 2025-12-19 07:41:10.004896

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a73b7189d1b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(36), nullable=False),  # UUID as string
        sa.Column('user_id', sa.String(36), nullable=False, index=True),  # UUID as string
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, default=False),
        sa.Column('version', sa.Integer(), nullable=False, default=1),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("length(id) = 36", name="check_uuid_length_id"),
        sa.CheckConstraint("length(user_id) = 36", name="check_uuid_length_user_id")
    )

    # Create composite index for user_id and completed
    op.create_index('ix_tasks_user_completed', 'tasks', ['user_id', 'completed'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the tasks table
    op.drop_table('tasks')
