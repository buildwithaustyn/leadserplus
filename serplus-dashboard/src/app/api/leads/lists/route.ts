import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface FilterCriteria {
  column: string;
  operator: string;
  value: any;
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get('id');

  try {
    if (listId) {
      // Get specific list with its members
      const { data: list, error: listError } = await supabase
        .from('lead_lists')
        .select('*, lead_list_members(lead_id)')
        .eq('id', listId)
        .single();

      if (listError) throw listError;

      if (list.is_dynamic && list.filter_criteria) {
        // For dynamic lists, fetch leads based on filter criteria
        const criteria = list.filter_criteria as FilterCriteria[];
        let query = supabase.from('leads').select('*');
        
        // Apply each filter criterion
        criteria.forEach((filter) => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });

        const { data: leads, error: leadsError } = await query;

        if (leadsError) throw leadsError;

        return NextResponse.json({ list: { ...list, leads } });
      } else {
        // For static lists, fetch leads from members
        const leadIds = list.lead_list_members.map((member: any) => member.lead_id);
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .in('id', leadIds);

        if (leadsError) throw leadsError;

        return NextResponse.json({ list: { ...list, leads } });
      }
    } else {
      // Get all lists
      const { data: lists, error } = await supabase
        .from('lead_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ lists });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching lists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { name, description, filter_criteria, is_dynamic, leads } = await request.json();

  try {
    const { data: list, error: listError } = await supabase
      .from('lead_lists')
      .insert([
        {
          name,
          description,
          filter_criteria: is_dynamic ? filter_criteria : null,
          is_dynamic,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single();

    if (listError) throw listError;

    // For static lists, add lead members
    if (!is_dynamic && leads?.length > 0) {
      const members = leads.map((leadId: string) => ({
        list_id: list.id,
        lead_id: leadId,
      }));

      const { error: membersError } = await supabase
        .from('lead_list_members')
        .insert(members);

      if (membersError) throw membersError;
    }

    return NextResponse.json({ list });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating list' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id, name, description, filter_criteria, is_dynamic, leads } = await request.json();

  try {
    const { data: list, error: listError } = await supabase
      .from('lead_lists')
      .update({
        name,
        description,
        filter_criteria: is_dynamic ? filter_criteria : null,
        is_dynamic,
      })
      .eq('id', id)
      .select()
      .single();

    if (listError) throw listError;

    if (!is_dynamic) {
      // Delete existing members
      const { error: deleteError } = await supabase
        .from('lead_list_members')
        .delete()
        .eq('list_id', id);

      if (deleteError) throw deleteError;

      // Add new members
      if (leads?.length > 0) {
        const members = leads.map((leadId: string) => ({
          list_id: id,
          lead_id: leadId,
        }));

        const { error: membersError } = await supabase
          .from('lead_list_members')
          .insert(members);

        if (membersError) throw membersError;
      }
    }

    return NextResponse.json({ list });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating list' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('lead_lists')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting list' }, { status: 500 });
  }
}