/**
 * ChatwootService - Integração com API do Chatwoot
 * 
 * Baseado em: múltiplos docs (bridge, schema, etc)
 */

import axios, { AxiosInstance } from 'axios';

interface ChatwootConfig {
  baseUrl: string;
  accountId: number;
  apiAccessToken: string;
}

interface ContactPayload {
  identifier?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  custom_attributes?: Record<string, any>;
}

interface ConversationPayload {
  source_id: string;
  inbox_id: number;
  contact_id: number;
  status?: 'open' | 'resolved' | 'pending';
}

interface MessagePayload {
  content: string;
  message_type: 'incoming' | 'outgoing';
  private?: boolean;
  content_type?: 'text' | 'input_select' | 'cards' | 'form';
  content_attributes?: Record<string, any>;
}

export class ChatwootService {
  private client: AxiosInstance;
  private config: ChatwootConfig;

  constructor(config: ChatwootConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'api_access_token': config.apiAccessToken,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  // ========================================
  // CONTACTS
  // ========================================

  /**
   * Buscar contato por identifier (phone)
   */
  async findContactByIdentifier(identifier: string): Promise<any | null> {
    try {
      const { data } = await this.client.get(
        `/api/v1/accounts/${this.config.accountId}/contacts/search`,
        { params: { q: identifier } }
      );

      const payload = data?.payload || [];
      return payload.find((c: any) => c.identifier === identifier) || null;
    } catch (error) {
      console.error('[ChatwootService] Erro ao buscar contato:', error);
      return null;
    }
  }

  /**
   * Criar contato
   */
  async createContact(payload: ContactPayload): Promise<any> {
    const { data } = await this.client.post(
      `/api/v1/accounts/${this.config.accountId}/contacts`,
      payload
    );

    return data?.payload;
  }

  /**
   * Atualizar contato
   */
  async updateContact(contactId: number, payload: Partial<ContactPayload>): Promise<any> {
    const { data } = await this.client.put(
      `/api/v1/accounts/${this.config.accountId}/contacts/${contactId}`,
      payload
    );

    return data?.payload;
  }

  /**
   * Garantir que contato existe (busca ou cria)
   */
  async ensureContact(params: {
    phone: string;
    name?: string;
    customAttributes?: Record<string, any>;
  }): Promise<any> {
    const identifier = params.phone.includes('@') 
      ? params.phone 
      : `${params.phone}@c.us`;

    // Tentar encontrar
    let contact = await this.findContactByIdentifier(identifier);

    if (contact) {
      console.log('[ChatwootService] Contato encontrado:', contact.id);
      return contact;
    }

    // Criar novo
    console.log('[ChatwootService] Criando novo contato:', identifier);
    contact = await this.createContact({
      identifier,
      name: params.name || params.phone,
      phone_number: params.phone,
      custom_attributes: params.customAttributes,
    });

    return contact;
  }

  // ========================================
  // CONTACT INBOXES
  // ========================================

  /**
   * Criar contact_inbox (vincula contato a inbox)
   */
  async createContactInbox(params: {
    contactId: number;
    inboxId: number;
    sourceId: string;
  }): Promise<any> {
    try {
      const { data } = await this.client.post(
        `/api/v1/accounts/${this.config.accountId}/contact_inboxes`,
        {
          inbox_id: params.inboxId,
          contact_id: params.contactId,
          source_id: params.sourceId,
        }
      );

      return data?.payload;
    } catch (error: any) {
      // Se já existe, ignorar erro
      if (error.response?.status === 422) {
        console.warn('[ChatwootService] ContactInbox já existe');
        return null;
      }
      throw error;
    }
  }

  // ========================================
  // CONVERSATIONS
  // ========================================

  /**
   * Buscar conversa por source_id
   */
  async findConversationBySourceId(params: {
    inboxId: number;
    sourceId: string;
  }): Promise<any | null> {
    try {
      const { data } = await this.client.get(
        `/api/v1/accounts/${this.config.accountId}/conversations`,
        {
          params: {
            inbox_id: params.inboxId,
            status: 'all',
          },
        }
      );

      const conversations = data?.data?.payload || [];
      return conversations.find((c: any) => 
        c.meta?.sender?.additional_attributes?.contact_inbox?.source_id === params.sourceId
      ) || null;
    } catch (error) {
      console.error('[ChatwootService] Erro ao buscar conversa:', error);
      return null;
    }
  }

  /**
   * Criar conversa
   */
  async createConversation(payload: ConversationPayload): Promise<any> {
    const { data } = await this.client.post(
      `/api/v1/accounts/${this.config.accountId}/conversations`,
      payload
    );

    return data;
  }

  /**
   * Garantir que conversa existe (busca ou cria)
   */
  async ensureConversation(params: {
    inboxId: number;
    contactId: number;
    sourceId: string;
  }): Promise<any> {
    // Tentar encontrar
    let conversation = await this.findConversationBySourceId({
      inboxId: params.inboxId,
      sourceId: params.sourceId,
    });

    if (conversation) {
      console.log('[ChatwootService] Conversa encontrada:', conversation.id);
      return conversation;
    }

    // Criar nova
    console.log('[ChatwootService] Criando nova conversa');
    conversation = await this.createConversation({
      source_id: params.sourceId,
      inbox_id: params.inboxId,
      contact_id: params.contactId,
      status: 'open',
    });

    return conversation;
  }

  // ========================================
  // MESSAGES
  // ========================================

  /**
   * Criar mensagem em uma conversa (incoming = vindo do WhatsApp)
   */
  async createMessageFromWhatsApp(params: {
    conversationId: number;
    content: string;
    messageType?: string;
    contentAttributes?: Record<string, any>;
  }): Promise<any> {
    const { data } = await this.client.post(
      `/api/v1/accounts/${this.config.accountId}/conversations/${params.conversationId}/messages`,
      {
        content: params.content,
        message_type: 'incoming',
        private: false,
        content_type: params.messageType || 'text',
        content_attributes: params.contentAttributes,
      } as MessagePayload
    );

    return data;
  }

  /**
   * Criar mensagem de sistema (privada)
   */
  async createSystemMessage(params: {
    conversationId: number;
    content: string;
  }): Promise<any> {
    const { data } = await this.client.post(
      `/api/v1/accounts/${this.config.accountId}/conversations/${params.conversationId}/messages`,
      {
        content: params.content,
        message_type: 'outgoing',
        private: true,
      } as MessagePayload
    );

    return data;
  }

  /**
   * Notificar falha de envio (DLQ)
   */
  async notifySendFailure(params: {
    conversationId: number;
    contactKey: string;
    attempts: number;
    errorMessage: string;
  }): Promise<void> {
    const text = [
      '**SYSTEM:** ⚠️ Falha ao enviar mensagem para o WhatsApp.',
      `Contato: ${params.contactKey}`,
      `Tentativas: ${params.attempts}`,
      `Erro: ${params.errorMessage}`,
      '',
      'A mensagem foi movida para a fila de erros (DLQ).',
      'Use o comando `.retry` para tentar novamente.',
    ].join('\n');

    await this.createSystemMessage({
      conversationId: params.conversationId,
      content: text,
    });
  }

  /**
   * Notificar fila limpa
   */
  async notifyQueueCleared(params: {
    conversationId: number;
    contactKey: string;
    queueCleared: number;
    dlqCleared: number;
  }): Promise<void> {
    const text = [
      '**SYSTEM:** 🗑️ Fila de mensagens limpa.',
      `Contato: ${params.contactKey}`,
      `Mensagens removidas da fila: ${params.queueCleared}`,
      `Mensagens removidas da DLQ: ${params.dlqCleared}`,
    ].join('\n');

    await this.createSystemMessage({
      conversationId: params.conversationId,
      content: text,
    });
  }

  // ========================================
  // CONVERSATIONS STATUS
  // ========================================

  /**
   * Reabrir conversa (se estiver resolvida)
   */
  async reopenConversation(conversationId: number): Promise<void> {
    try {
      await this.client.post(
        `/api/v1/accounts/${this.config.accountId}/conversations/${conversationId}/toggle_status`,
        { status: 'open' }
      );
    } catch (error) {
      console.error('[ChatwootService] Erro ao reabrir conversa:', error);
    }
  }
}
