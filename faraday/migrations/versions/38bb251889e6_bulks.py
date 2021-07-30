"""empty message

Revision ID: 38bb251889e6
Revises: 97a9348d0406
Create Date: 2021-07-30 02:12:00.706416+00:00

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '38bb251889e6'
down_revision = '97a9348d0406'
branch_labels = None
depends_on = None


def upgrade():

    # Agent table
    op.drop_constraint('executor_agent_id_fkey', 'executor')
    op.create_foreign_key(
        'executor_agent_id_fkey',
        'executor',
        'agent', ['agent_id'], ['id'],
        ondelete='CASCADE'
    )
    op.drop_constraint('association_workspace_and_agents_table_agent_id_fkey',
                       'association_workspace_and_agents_table')
    op.create_foreign_key(
        'association_workspace_and_agents_table_agent_id_fkey',
        'association_workspace_and_agents_table',
        'agent', ['agent_id'], ['id'],
        ondelete='CASCADE'
    )

    # Vulnerability_template table
    op.drop_constraint('knowledge_base_vulnerability_template_id_fkey',
                       'knowledge_base')
    op.create_foreign_key(
        'knowledge_base_vulnerability_template_id_fkey', 'knowledge_base',
        'vulnerability_template', ['vulnerability_template_id'], ['id'],
        ondelete='CASCADE'
    )

    # Comment table
    op.drop_constraint('comment_reply_to_id_fkey',
                       'comment')
    op.create_foreign_key(
        'comment_reply_to_id_fkey', 'comment',
        'comment', ['reply_to_id'], ['id'],
        ondelete='SET NULL'
    )

    # Credential table
    op.drop_constraint('credential_host_id_fkey', 'credential')
    op.create_foreign_key(
        'credential_host_id_fkey', 'credential',
        'host', ['host_id'], ['id'],
        ondelete='SET NULL'
    )
    op.drop_constraint('credential_service_id_fkey', 'credential')
    op.create_foreign_key(
        'credential_service_id_fkey', 'credential',
        'service', ['service_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade():

    # Agent table
    op.drop_constraint('executor_agent_id_fkey',
                       'executor')
    op.create_foreign_key(
        'executor_agent_id_fkey',
        'executor',
        'agent', ['agent_id'], ['id']
    )
    op.drop_constraint('association_workspace_and_agents_table_agent_id_fkey',
                       'association_workspace_and_agents_table')
    op.create_foreign_key(
        'association_workspace_and_agents_table_agent_id_fkey',
        'association_workspace_and_agents_table',
        'agent', ['agent_id'], ['id']
    )

    # Vulnerability_template table
    op.drop_constraint('knowledge_base_vulnerability_template_id_fkey',
                       'knowledge_base')
    op.create_foreign_key(
        'knowledge_base_vulnerability_template_id_fkey', 'knowledge_base',
        'vulnerability_template', ['vulnerability_template_id'], ['id']
    )

    # Comment table
    op.drop_constraint('comment_reply_to_id_fkey',
                       'comment')
    op.create_foreign_key(
        'comment_reply_to_id_fkey', 'comment',
        'comment', ['reply_to_id'], ['id']
    )

    # Credential table
    op.drop_constraint('credential_host_id_fkey', 'credential')
    op.create_foreign_key(
        'credential_host_id_fkey', 'credential',
        'host', ['host_id'], ['id']
    )
    op.drop_constraint('credential_service_id_fkey', 'credential')
    op.create_foreign_key(
        'credential_service_id_fkey', 'credential',
        'service', ['service_id'], ['id']
    )
